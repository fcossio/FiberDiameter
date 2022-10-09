import SystemMenu from "./SystemMenu";
import Editor from "./Editor";
import { ChangeEvent, createContext, Dispatch, SetStateAction, useState } from "react";
import SidePanel from "./SidePanel";
import Fiber from "../types/Fiber";

interface ImageContextType {
  imageDimsInPx: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  scaleLength: number;
  fibers: Fiber[];
  setFibers: Dispatch<SetStateAction<Fiber[]>>;
  magnitude: string
}

export const ImageContext = createContext<ImageContextType | undefined>(
  undefined
);

const createInitialFibers = () =>
  [
    {
      id: 1,
      color: "#94DC38",
      diameter: 13.254,
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
      id: 2,
      color: "#DC38B8",
      diameter: 14.432,
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
  
const App = () => {
  const [fibers, setFibers] = useState<Fiber[]>(createInitialFibers());

  const [state, setState] = useState({
    isValidScale: true,
    magnitude: "nm",
    scaleLength: 400,
  });

  const onScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    let number = parseFloat(value);
    if (!Number.isNaN(number)) {
      setState({ ...state, isValidScale: true, scaleLength: number });
    } else {
      setState({ ...state, isValidScale: false });
    }
  };

  return (
    <div className='container'>
      <ImageContext.Provider
        value={{
          imageDimsInPx: {
            width: 0,
            height: 0,
            x: 0,
            y: 0,
          },
          scaleLength: state.scaleLength,
          fibers,
          setFibers,
          magnitude: state.magnitude
        }}
      >
        <SystemMenu className='w-full' />
        <div className='flex h-[90vh]'>
          <SidePanel
            fibers={fibers}
            onScaleChange={onScaleChange}
            isValidScale={state.isValidScale}
          />
          <div id='editor' className='w-full bg-slate-200'>
            <Editor />
          </div>
        </div>
      </ImageContext.Provider>
    </div>
  );
};

export default App;
