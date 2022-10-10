import SystemMenu from "./SystemMenu";
import { Props as FiberItemProps } from "./FiberItem";
import Editor from "./Editor";
import { ChangeEvent, createContext, useState } from "react";
import { useDebouncedState } from "@mantine/hooks";
import SidePanel from "./SidePanel";
  
export const ScaleContext = createContext(0);

const App = () => {
  let fibers: FiberItemProps[] = [
    {
      id: 1,
      color: "94DC38",
      diameter: 13.254,
    },
    {
      id: 2,
      color: "DC38B8",
      diameter: 14.432,
    },
  ];

  const [state, setState] = useState({
    isValidScale: true,
  });

  
  const [scaleLength, setScaleLength] = useDebouncedState(400, 200, {
    leading: true,
  });

  const onScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    let number = parseFloat(value);
    if (!Number.isNaN(number)) {    
      setScaleLength(number);
      setState({ ...state, isValidScale: true });
    } else {
      setState({ ...state, isValidScale: false });
    }
  }

  return (
    <div className='container'>
      <ScaleContext.Provider value={scaleLength}>

      <SystemMenu className='w-full' />
      <div className='flex h-[90vh]'>
        <SidePanel fibers={fibers} onScaleChange={onScaleChange} isValidScale={state.isValidScale}/>
        <div id='editor' className='w-full bg-slate-200'>
          <Editor/>
        </div>
      </div>
      </ScaleContext.Provider>
    </div>
  );
};

export default App;
