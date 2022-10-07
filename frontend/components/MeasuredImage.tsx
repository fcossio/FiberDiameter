import React, { memo, useEffect, useState, useContext } from "react";

import { calculateDistance, calculateArea } from "@coszio/react-measurements";
import FiberLayer from "./FiberLayer";
import { calculateRealImageSize, getObjectFitSize } from "../utils";
import ScaleLayer from "./ScaleLayer";
import { ScaleContext } from "./App";

const createInitialMeasurements = () => [
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

const initialScale = () => {
  return {
    id: 0,
    type: "line",
    startX: 0.83,
    startY: 0.94,
    endX: 0.916,
    endY: 0.94,
  };
};

interface Props {
}

const MeasuredImage = (props: Props) => {
  const scaleLength = useContext(ScaleContext);

  const [fibers, setFibers] = useState(createInitialMeasurements());

  const [state, setState] = useState({
    loaded: false,
  });
  const [scaleMeasurement, setScaleMeasurement] = useState(initialScale());
  const [scale, setScale] = useState({ width: 0, height: 0 });

  const [image, setImage] = useState(new Image());
  const [imageDims, setImageDims] = useState(getObjectFitSize(true, image));

  const onChange = (fiberId: number, measurements: any) => {
    let newFibers = [...fibers];
    newFibers[fiberId].measurements = measurements;
    setFibers(newFibers);
  };

  const measureLine = (line: any) =>
    Math.round(calculateDistance(line, scale.width, scale.height)) + " nm";

  const measureCircle = (circle: any) =>
    Math.round(calculateArea(circle, scale.width, scale.height) / 10) * 10 +
    " nm²";

  const onImageLoaded = () => setState({ ...state, loaded: true });
  
  // update size of measurement layers
  useEffect(() => {
    const onImageBoundsChanged = () =>
      setImageDims(getObjectFitSize(true, image));
    
    window.addEventListener("resize", onImageBoundsChanged);
    onImageBoundsChanged();
  }, [image]);

  // update real scale of the image
  useEffect(() => {
    setScale(
      calculateRealImageSize(scaleMeasurement, scaleLength, imageDims)
    );
  }, [scaleMeasurement, imageDims, scaleLength]);

  return (
    <div className='relative'>
      <picture>
        <source srcSet='/images/fibers.png' type='image/webp' />
        <img
          src='/images/fibers.png'
          alt='fibers image'
          ref={(e) => setImage(e!)}
          onLoad={onImageLoaded}
          className='object-contain w-full h-[90vh]'
        />
      </picture>
      {state.loaded &&
        <>
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
          <ScaleLayer
            measurement={scaleMeasurement}
            color={"#FAFAFA"}
            imageDims={imageDims}
            onChange={(measurements) => setScaleMeasurement(measurements[0])}
            measureLine={(line) => "scale: " + measureLine(line)}
            measureCircle={measureCircle}
          />
        </>
      }
    </div>
  );
};

export default memo(MeasuredImage);
