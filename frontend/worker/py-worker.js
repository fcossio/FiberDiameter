const pyodideWorker = new Worker("webworker.js"); // TODO: move this to a nicer place

const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  // console.log(data);
  // console.log("id: " + id);
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

// pyodideWorker.onerror = (event) => {
//   console.log(event)
// };

export const runAsync = (() => {
  let id = 0; // identify a Promise
  return (imgPath, targetCoords) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      // console.log(onSuccess);
      // console.log("Entered the promise")
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        imgPath,
        targetCoords,
        id
      });
    })
  };
})();
