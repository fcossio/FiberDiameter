import {
  memo,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from "react";

import { calculateArea, calculateDistance } from "@coszio/react-measurements";
import { calculateRealImageSize, getObjectFitSize } from "../utils";
import { AppContext } from "./App";
import FiberLayer from "./FiberLayer";
import ScaleLayer from "./ScaleLayer";
import { runAsync } from "../worker/py-worker";
import { randomColor } from "randomcolor";
import InferencePointer from "./InferencePointer";
import { toast } from "react-toastify";

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
    addFiber,
    appState: {
      realDims,
      htmlImageDims,
      magnitude,
      scaleLength,
      isChoosingTarget,
      imagePath,
      pendingInferences,
    },
    setAppState,
  } = useContext(AppContext)!;

  const [state, setState] = useState({
    loaded: false,
  });
  const [scaleMeasurement, setScaleMeasurement] = useState(initialScale());

  const [image, setImage] = useState(new Image());

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
      setAppState((prevAppState) => ({
        ...prevAppState,
        htmlImageDims: getObjectFitSize(true, image),
      }));

    window.addEventListener("resize", onImageBoundsChanged);
    onImageBoundsChanged();
  }, [image, state.loaded]);

  // update real scale of the image
  useEffect(() => {
    setAppState((prevAppState) => ({
      ...prevAppState,
      htmlImageDims,
      realDims: calculateRealImageSize(
        scaleMeasurement,
        scaleLength,
        htmlImageDims
      ),
    }));
  }, [scaleMeasurement, htmlImageDims, scaleLength, setAppState]);

  const inferFiber: MouseEventHandler = async (event) => {
    setAppState((prevState) => ({
      ...prevState,
      isChoosingTarget: false,
    }));

    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) / htmlImageDims.width;
    const y = (event.clientY - rect.top) / htmlImageDims.height;
    const color = randomColor();
    console.log(x, y);

    // add inference mark
    const id = Math.max(0, ...pendingInferences.map((req) => req.id)) + 1;
    console.log("new inference request, id: " + id);
    setAppState((prevState) => {
      prevState.pendingInferences.push({ x, y, color, id });
      return {
        ...prevState,
        pendingInferences: [...prevState.pendingInferences],
      };
    });

    try {
      console.time("inference");
      const res = await runAsync(imagePath, [x, y]);
      console.log(res);
      const inferredFiber = JSON.parse(res.fiber);
      const measurements = inferredFiber.lines.map((line: any, id: number) => ({
        ...line,
        id,
        type: "line",
      }));
      addFiber(measurements, color);
    } catch (error: any) {
      toast.error(error.toString());
    }
    // remove inference mark
    setAppState((prevState) => {
      const popIndex = prevState.pendingInferences.findIndex(
        (req) => req.id == id
      );
      prevState.pendingInferences.splice(popIndex, 1);
      return {
        ...prevState,
        pendingInferences: [...prevState.pendingInferences],
      };
    });
    console.timeEnd("inference");
  };

  return (
    <div className='relative'>
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
              onChange={(measurements) => onLayerChange(key, measurements)}
              measureLine={measureLine}
              measureCircle={measureCircle}
            />
          ))}
          <ScaleLayer
            measurement={scaleMeasurement}
            color={"#FAFAFA"}
            onChange={(measurements) => setScaleMeasurement(measurements[0])}
            measureLine={(line) => "scale: " + measureLine(line)}
            measureCircle={measureCircle}
          />
          {pendingInferences.map((props, key) => {
            return <InferencePointer key={key} {...props} />;
          })}
          <div
            className={`absolute object-contain opacity-10 ${
              isChoosingTarget
                ? "bg-green-300 cursor-wand"
                : "pointer-events-none"
            }`}
            style={{
              left: htmlImageDims.x,
              top: htmlImageDims.y,
              width: htmlImageDims.width,
              height: htmlImageDims.height,
            }}
            onClick={inferFiber}
          />
        </>
      )}
    </div>
  );
};

export default memo(MeasuredImage);
