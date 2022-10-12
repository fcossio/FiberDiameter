import {
  ChangeEvent,
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { Fiber, Line } from "../types";
import Editor from "./Editor";
import SidePanel from "./SidePanel";
import SystemMenu from "./SystemMenu";
import { Props as PendingInferenceProps } from "./InferencePointer"

interface State {
  isValidScale: boolean;
  magnitude: string;
  scaleLength: number;
  realDims: { width: number; height: number };
  htmlImageDims: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  isChoosingTarget: boolean;
  imagePath: string;
  pendingInferences: PendingInferenceProps[];
}

interface AppContextType {
  fibers: Fiber[];
  setFibers: Dispatch<SetStateAction<Fiber[]>>;
  appState: State;
  setAppState: Dispatch<SetStateAction<State>>;
  addFiber: (measurements: Line[], color: string) => void;
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
    htmlImageDims: { width: 0, height: 0, x: 0, y: 0 },
    isChoosingTarget: false,
    imagePath: "/images/fibers.png",
    pendingInferences: [] as PendingInferenceProps[],
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

  const addFiber = (measurements: Line[], color: string) => {
    setFibers((prevFibers) => {
      const id = Math.max(0, ...fibers.map((fiber) => fiber.id)) + 1;
      prevFibers.push({
        id,
        color,
        measurements,
      });
      return [...prevFibers];
    });
  };
  return (
    <div className='container'>
      <AppContext.Provider
        value={{
          fibers,
          setFibers,
          addFiber,
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
