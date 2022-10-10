const pyodideWorker = new Worker("webworker.js"); // TODO: move this to a nicer place

const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = ((img_url) => {
  let id = 0; // identify a Promise
  return (script, context) => { // TODO: script is no longer needed, but we want to pass the image_url and the location of the click
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script, //TODO: modifiy args
        img_url: img_url,
        id,
      });
    });
  };
})();

export { asyncRun };
