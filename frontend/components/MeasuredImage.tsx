import React, { FunctionComponent, useState, memo, useEffect } from "react";

import { calculateDistance, calculateArea } from "@coszio/react-measurements";
import FiberLayer from "./FiberLayer";
import { getObjectFitSize } from "../utils";

const createInitialState = () => [
  {
    id: 0,
    color: "#FA04FF",
    measurements: [
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
    ],
  },
  {
    id: 1,
    color: "#4A04FF",
    measurements: [
      {
        id: 0,
        type: "line",
        startX: 0.63,
        startY: 0.44,
        endX: 0.216,
        endY: 0.324,
      },
      {
        id: 1,
        type: "line",
        startX: 0.183,
        startY: 0.43,
        endX: 0.416,
        endY: 0.424,
      },
    ],
  },
];
interface Props {
  onImageLoaded: () => void;
}

const MeasuredImage: FunctionComponent<Props> = (props) => {
  const [fibers, setFibers] = useState(createInitialState());

  const [image, setImage] = useState(new Image());
  const [imageDims, setImageDims] = useState(getObjectFitSize(true, image));

  const onChange = (fiberId: number, measurements: any) => {
    let newFibers = [...fibers];
    newFibers[fiberId].measurements = measurements;
    setFibers(newFibers);
  };

  const measureLine = (line: any) =>
    Math.round(calculateDistance(line, 300, 300)) + " μm";

  const measureCircle = (circle: any) =>
    Math.round(calculateArea(circle, 300, 300) / 10) * 10 + " μm²";

  useEffect(() => {
    const onImageBoundsChanged = () =>
      setImageDims(getObjectFitSize(true, image));

    window.addEventListener("resize", onImageBoundsChanged);

    onImageBoundsChanged();
  }, [image]);

  return (
    <div className='relative'>
      <picture>
        <source srcSet='/images/fibers.png' type='image/webp' />
        <img
          src='/images/fibers.png'
          alt='fibers image'
          ref={(e) => setImage(e!)}
          onLoad={props.onImageLoaded}
          className='object-contain w-full h-[90vh]'
        />
      </picture>
      {fibers.map((fiber, key) => (
        <FiberLayer
          key={key}
          fiberId={fiber.id}
          measurements={fiber.measurements}
          color={fiber.color}
          imageDims={imageDims}
          onChange={(measurements) => onChange(fiber.id, measurements)}
          measureLine={measureLine}
          measureCircle={measureCircle}
        />
      ))}
    </div>
  );
};

export default memo(MeasuredImage);
