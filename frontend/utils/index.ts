// adapted from: https://www.npmjs.com/package/intrinsic-scale

import { Fiber } from "../types";
import { calculateDistance } from "@coszio/react-measurements";

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

export const average = (arr: number[]) => {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

export const fibersToCSV = (
  fibers: Fiber[],
  realDims: { width: number; height: number },
  magnitude: string
) => {
  const headers = [
    "fiberId",
    `measureLength (${magnitude})`,
    "startX (%)",
    "startY (%)",
    "endX (%)",
    "endY (%)",
  ].join(",");

  const data = fibers
    .map(
      (fiber) =>
        fiber.measurements
          .map((line) => {
            const realLength = calculateDistance(
              line,
              realDims.width,
              realDims.height
            );
            return [
              fiber.id,
              realLength,
              line.startX,
              line.startY,
              line.endX,
              line.endY,
            ].join(","); // line
          })
          .join("\n") // lines in fiber
    )
    .join("\n"); // all lines of all fibers

  return [headers, data].join("\n");
};
