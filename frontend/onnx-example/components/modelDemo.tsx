
// import myscript from '../python/script.py'
import { useState, useEffect } from 'react'
import { asyncRun } from '../public/py-worker.js' // TODO: move this to a nicer place

// TODO: This var is not needed anymore I think
declare global { // <- [reference](https://stackoverflow.com/a/56458070/11542903)
  interface Window {
    pyodide: any;
    languagePluginLoader: any;
  }
}

export default function ModelDemo() {

  const [output, setOutput] = useState("loading...");

  const runCode = async () => {
    let python_code = await fetch("/load_image.py").then(response => response.text()) // TODO: no need to pass the python code from here, it will be loaded in the webworker.js
    let x = await asyncRun(python_code); // TODO: no need to pass the python code from here, it will be loaded in the webworker.js
    // let result = await JSON.parse(x.results_str)
    console.log(x)
    setOutput(x.results_str);
  }

  useEffect(() => { // TODO: We want to run this onClick when the inference tooltip is selected
    runCode()
  },[])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          5 + 7 = {output}
        </p>
      </header>
    </div>
  );
}
