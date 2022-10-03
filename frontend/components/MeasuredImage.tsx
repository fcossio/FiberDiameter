import React, { FunctionComponent, useState, memo, useEffect } from "react";

import {
  MeasurementLayer,
  calculateDistance,
  calculateArea,
} from "@coszio/react-measurements";

const createInitialState = () => [
  {
    id: 0,
    type: "line",
    startX: 0.183,
    startY: 0.33,
    endX: 0.316,
    endY: 0.224,
  },
  {
    id: 1,
    type: "line",
    startX: 0.183,
    startY: 0.43,
    endX: 0.416,
    endY: 0.424,
  },
];
interface Props {
  onImageLoaded: () => void;
}

// adapted from: https://www.npmjs.com/package/intrinsic-scale
function getObjectFitSize(
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

const MeasuredImage: FunctionComponent<Props> = (props) => {
  const [measurements, setMeasurements] = useState(createInitialState());

  const [image, setImage] = useState(new Image());
  const [imageDims, setImageDims] = useState(getObjectFitSize(true, image));

  const onChange = (measurements: any) => setMeasurements(measurements);

  const measureLine = (line: any) =>
    Math.round(calculateDistance(line, 300, 300)) + " μm";

  const measureCircle = (circle: any) =>
    Math.round(calculateArea(circle, 300, 300) / 10) * 10 + " μm²";

  const onLoad = () => {
    props.onImageLoaded();
  };

  useEffect(() => {
    const onImageBoundsChanged = () =>
      setImageDims(getObjectFitSize(true, image));
    window.addEventListener("resize", onImageBoundsChanged);
    onImageBoundsChanged();
  }, [image]);

  return (
    <div className='relative'>
      <img
        src='/images/fibers.png'
        alt='Pollen grains'
        ref={(e) => setImage(e!)}
        onLoad={onLoad}
        className='object-contain w-full h-[90vh]'
      />
      <div
        className='absolute'
        style={{
          width: `${imageDims.width}px`,
          height: `${imageDims.height}px`,
          top: `${imageDims.y}px`,
          left: `${imageDims.x}px`,
        }}
      >
        <MeasurementLayer
          measurements={measurements}
          widthInPx={imageDims.width}
          heightInPx={imageDims.height}
          onChange={onChange}
          measureLine={measureLine}
          measureCircle={measureCircle}
        />
      </div>
    </div>
  );
};

export default memo(MeasuredImage);
