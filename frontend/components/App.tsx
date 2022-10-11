import { StaticImageData } from "next/image";
import {
  ChangeEvent,
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { Dims, Fiber } from "../types";
import Editor from "./Editor";
import SidePanel from "./SidePanel";
import SystemMenu from "./SystemMenu";

interface State {
  isValidScale: boolean;
  magnitude: string;
  scaleLength: number;
  realDims: { width: number; height: number };
  isChoosingTarget: boolean;
}

interface AppContextType {
  imageDimsInPx: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  fibers: Fiber[];
  setFibers: Dispatch<SetStateAction<Fiber[]>>;
  appState: State;
  setAppState: Dispatch<SetStateAction<State>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const createInitialFibers = () => [
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
  // fibers along with their measurements
  const [fibers, setFibers] = useState<Fiber[]>(createInitialFibers());

  // other "cheap" state changes
  const [state, setState] = useState({
    isValidScale: true,
    magnitude: "nm",
    scaleLength: 400,
    realDims: { width: 0, height: 0 },
    isChoosingTarget: false,
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
      <AppContext.Provider
        value={{
          imageDimsInPx: {
            width: 0,
            height: 0,
            x: 0,
            y: 0,
          },
          fibers,
          setFibers,
          appState: state,
          setAppState: setState,
        }}
      >
        <SystemMenu className='w-full' />
        <div className='flex h-[90vh]'>
          <SidePanel
            onScaleChange={onScaleChange}
            isValidScale={state.isValidScale}
          />
          <div id='editor' className='w-full bg-slate-200'>
            <Editor />
          </div>
        </div>
      </AppContext.Provider>
    </div>
  );
};

export default App;
