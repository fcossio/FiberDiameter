import { memo, useContext, useEffect, useState } from "react";

import { calculateArea, calculateDistance } from "@coszio/react-measurements";
import { calculateRealImageSize, getObjectFitSize } from "../utils";
import { AppContext } from "./App";
import FiberLayer from "./FiberLayer";
import ScaleLayer from "./ScaleLayer";

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

interface Props {}

const MeasuredImage = (props: Props) => {
  const {
    fibers,
    setFibers,
    appState: { realDims, magnitude, scaleLength, isChoosingTarget },
    setAppState,
  } = useContext(AppContext)!;

  const [state, setState] = useState({
    loaded: false,
  });
  const [scaleMeasurement, setScaleMeasurement] = useState(initialScale());

  const [image, setImage] = useState(new Image());

  // image dimensions in pixels
  const [imageDims, setImageDims] = useState(getObjectFitSize(true, image));

  const onLayerChange = (fiberKey: number, measurements: any) => {
    setFibers((prevFibers) => {
      prevFibers[fiberKey].measurements = measurements;
      return [...fibers];
    });
  };

  const measureLine = (line: any) =>
    Math.round(calculateDistance(line, realDims.width, realDims.height) * 1) /
      1 +
    ` ${magnitude}`;

  const measureCircle = (circle: any) =>
    Math.round(calculateArea(circle, realDims.width, realDims.height) * 10) /
      10 +
    ` ${magnitude}²`;

  const onImageLoaded = () => setState({ ...state, loaded: true });

  // update size of measurement layers
  useEffect(() => {
    const onImageBoundsChanged = () =>
      setImageDims(getObjectFitSize(true, image));

    window.addEventListener("resize", onImageBoundsChanged);
    onImageBoundsChanged();
  }, [image, state.loaded]);

  // update real scale of the image
  useEffect(() => {
    setAppState((prevAppState) => ({
      ...prevAppState,
      realDims: calculateRealImageSize(
        scaleMeasurement,
        scaleLength,
        imageDims
      ),
    }));
  }, [scaleMeasurement, imageDims, scaleLength, setAppState]);

  return (
    <div className={`relative ${isChoosingTarget && "cursor-copy"}`}>
      <picture>
        <source srcSet='/images/fibers.png' type='image/webp' />
        <img
          src='/images/fibers.png'
          alt='fibers image'
          ref={(e) => setImage(e!)}
          onLoad={onImageLoaded}
          className='object-contain w-full h-[90vh] pointer-events-none'
        />
      </picture>
      {state.loaded && (
        <>
          {fibers.map((fiber, key) => (
            <FiberLayer
              key={key}
              fiberId={fiber.id}
              measurements={fiber.measurements}
              color={fiber.color}
              imageDims={imageDims}
              onChange={(measurements) => onLayerChange(key, measurements)}
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
      )}
    </div>
  );
};

export default memo(MeasuredImage);
