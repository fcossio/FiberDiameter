importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");
importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.wasm.min.js") // TODO: why do I have to manually put the wasm files in the public dir? shouldn't this take care of it?
//the wasm files need to be copied from node_modules/onnxruntime-web/dist/*.wasm to /public


async function loadPyodideAndPackages() { // TODO: this func also loads ORT, rename accordingly
  // load pyodide
  self.pyodide = await loadPyodide();
  let python_script = await fetch("/load_image.py").then(response => response.text())
  console.log("worker load Pyodide and Packages" + python_script)
  await self.pyodide.loadPackagesFromImports(python_script)
  console.log("loaded packages correctly")
  let pyapi = await self.pyodide.runPython(python_script)
  // add the functions to self
  for (const key of pyapi.keys()) {
    console.log(key)
      self[key] = pyapi.get(key);
    }

  // load ONNX Runtime session
  self.ortSession = await createORTSession()
}

let pyodideReadyPromise = loadPyodideAndPackages();

function runCodeInJS(x, y){ // TODO: remove this, it's not used
  let result = x + y
  return result
}

async function runInference(flat_img_array, arr_dims){ // TODO: add warning that this model runs better in CHROME
  const start = new Date(); // TODO: use console.timer
  console.log(arr_dims)
  console.log('loading tensor')
  const data = Float32Array.from(flat_img_array);
  const tensor = new ort.Tensor('float32', data, arr_dims);
  console.log('running inference')
  inputs = {"serving_default_input_1:0": tensor} // TODO: find an automatic way of knowing the input layer name
  result = await self.ortSession.run(inputs)
  console.log(result)
  console.log(typeof result)
  const output_data = Object.values(result)[0]['data']
  const output_dims = Object.values(result)[0]['dims']
  const end = new Date();
  const inferenceTime = (end.getTime() - start.getTime())/1000;
  console.log('Done with inference in')
  console.log(inferenceTime)
  return [output_data, output_dims]
}

async function createORTSession(){
  console.log("creating ort session")
  const session = await ort.InferenceSession.create(
    "/royal-snowflake.lite.onnx", // TODO: the model needs to be in /public
    {executionProviders:['wasm'], graphOptimizationLevel:"all"});// TODO: for later... find a way to run in webGL?
  console.log("Inference Session created")
  return session
}

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;
  // (comment from tutorial) Don't bother yet with this line, suppose our API is built in such a way:
  const { id, python, img_path, ...context } = event.data; // TODO: args should modify the image and the selected position for inference
  try {
    console.log('worker onmessage event')
    let image = await self.get_image("/test.jpg") // TODO: load the image along with the worker maybe?
    let lines = await self.get_lines(image, [38,82], runInference) // TODO: args should come from UI
    let results_str = lines.toString() // TODO: check the format that react-measurements uses.
    self.postMessage({ results_str, id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};
