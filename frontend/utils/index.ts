// adapted from: https://www.npmjs.com/package/intrinsic-scale
export function getObjectFitSize(
  contains: boolean /* true = contain, false = cover */,
  image: HTMLImageElement
) {
  let doRatio = image.naturalWidth / image.naturalHeight;
  let cRatio = image.width / image.height;
  let targetWidth = 0;
  let targetHeight = 0;
  let test = contains ? doRatio > cRatio : doRatio < cRatio;

  if (test) {
    targetWidth = image.width;
    targetHeight = targetWidth / doRatio;
  } else {
    targetHeight = image.height;
    targetWidth = targetHeight * doRatio;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    x: (image.width - targetWidth) / 2,
    y: (image.height - targetHeight) / 2,
  };
}