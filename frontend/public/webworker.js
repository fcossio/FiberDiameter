importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");
importScripts(
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.12.1/dist/ort.wasm.min.js"
); // TODO: why do I have to manually put the wasm files in the public dir? shouldn't this take care of it?
//the wasm files need to be copied from node_modules/onnxruntime-web/dist/*.wasm to /public

/**
 * Loads Pyodide, ORT, and python packages in self
 */
async function loadOnce() {
  // load pyodide
  console.log("Webworker.js: Loading pyodide")
  self.pyodide = await loadPyodide();
  let python_script = await fetch("/load_image.py").then((response) =>
    response.text()
  );
  console.log("Webworker.js: Pyodide loading python packages found in script")
  await self.pyodide.loadPackagesFromImports(python_script);
  console.log("Webworker.js: Loaded pyodide packages correctly");
  let pyapi = await self.pyodide.runPythonAsync(python_script);
  // add the functions to self
  for (const key of pyapi.keys()) {
    console.log("Webworker.js: assigning self[" + key + "]");
    self[key] = pyapi.get(key);
  }

  // load ONNX Runtime session
  self.ortSession = await createORTSession();
}

const pyodideReadyPromise = loadOnce();

async function runInference(flat_img_array, arr_dims) {
  // TODO: add warning that this model runs better in CHROME
  const start = new Date(); // TODO: use console.timer
  console.log("Webworker.js: Creating tensor for onnxruntime");
  const data = Float32Array.from(flat_img_array);
  const tensor = new ort.Tensor("float32", data, arr_dims);
  console.log("Webworker.js: Start inference");
  const inputs = { "serving_default_input_1:0": tensor }; // TODO: find an automatic way of knowing the input layer name
  const result = await self.ortSession.run(inputs);
  const output_data = Object.values(result)[0]["data"];
  const output_dims = Object.values(result)[0]["dims"];
  const end = new Date();
  const inferenceTime = (end.getTime() - start.getTime()) / 1000;
  console.log("Webworker.js: Done with inference in");
  console.log(inferenceTime);
  return [output_data, output_dims];
}

async function createORTSession() {
  console.log("Webworker.js: Creating ORT session");
  const session = await ort.InferenceSession.create(
    "/royal-snowflake.lite.onnx", // TODO: the model needs to be in /public
    { executionProviders: ["wasm"], graphOptimizationLevel: "all" }
  ); // TODO: for later... find a way to run in webGL?
  console.log("Webworker.js: Inference Session created successfully");
  return session;
}

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;

  const { id, imgPath, targetCoords } = event.data;

  try {
    let image = await self.get_image(imgPath); // TODO: have the image in the self, loading it in loadOnce()
    let fiber = await self.inference_pyfunc(image, targetCoords, runInference);
    self.postMessage({ fiber, id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};
