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
  imagePath: string;
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

const App = () => {
  // fibers along with their measurements
  const [fibers, setFibers] = useState<Fiber[]>([]);

  // other "cheap" state changes
  const [state, setState] = useState({
    isValidScale: true,
    magnitude: "nm",
    scaleLength: 400,
    realDims: { width: 0, height: 0 },
    isChoosingTarget: false,
    imagePath: "/images/fibers.png",
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
