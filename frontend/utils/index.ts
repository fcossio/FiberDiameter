// adapted from: https://www.npmjs.com/package/intrinsic-scale
/**
 * 
 * @param contains Type of fitting: object-contain = `true`, object-cover = `false`
 * @param image HTML image reference
 * @returns The real fitted dimensions of the image, along with its offset
 */
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

/**
 * Calculates the real size of the image from a measurement and its length
 */ 
export const calculateRealImageSize = (
  measurement: any,
  length: number,
  imageDims: { width: number; height: number }
) => {
  let percentage_dx = Math.abs(measurement.startX - measurement.endX);
  let percentage_dy = Math.abs(measurement.startY - measurement.endY);

  let pixel_dx = percentage_dx * imageDims.width;
  let pixel_dy = percentage_dy * imageDims.height;

  let pixel_length = Math.sqrt(pixel_dx ** 2 + pixel_dy ** 2);

  return {
    width: (imageDims.width * length) / pixel_length,
    height: (imageDims.height * length) / pixel_length,
  };
};