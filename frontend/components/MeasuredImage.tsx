import { memo, useContext, useEffect, useState } from "react";

import { calculateArea, calculateDistance } from "@coszio/react-measurements";
import { calculateRealImageSize, getObjectFitSize } from "../utils";
import { AppContext } from "./App";
import FiberLayer from "./FiberLayer";
import ScaleLayer from "./ScaleLayer";
import { runAsync } from "../worker/py-worker";
import { randomColor } from 'randomcolor';

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
    appState: { realDims, magnitude, scaleLength, isChoosingTarget, imagePath },
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
    <div className="relative">
      <picture>
        <source srcSet={imagePath} type='image/webp' />
        <img
          src={imagePath}
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
          <div
            className={`absolute object-contain opacity-10 ${
              isChoosingTarget ? "bg-green-300 cursor-copy" : "pointer-events-none"
            }`}
            style={{
              left: imageDims.x,
              top: imageDims.y,
              width: imageDims.width,
              height: imageDims.height,
            }}
            onClick={async (event) => {
              setAppState((prevState) => ({...prevState, isChoosingTarget: false}));
              
              const rect = event.currentTarget.getBoundingClientRect();

              const x = (event.clientX - rect.left) / imageDims.width;
              const y = (event.clientY - rect.top) / imageDims.height;
              console.log(x, y);

              const res = await runAsync(imagePath, [x, y]);
              console.log(res);
              const inferredFiber = JSON.parse(res.fiber);
              console.log(inferredFiber);
              setFibers((prevFibers) => {
                const id = Math.max(...fibers.map((fiber) => fiber.id)) + 1;
                const measurements = inferredFiber.lines.map((line: any, id: number) => ({...line, id, type: "line"}))
                return [...prevFibers, {
                  id,
                  color: randomColor(),
                  measurements,
                }]
              })
            }}
          />
        </>
      )}
    </div>
  );
};

export default memo(MeasuredImage);
