import {useContext} from "react";
import { AppContext } from "./App";
import { CgSpinnerTwoAlt } from "react-icons/cg";

export interface Props {
  x: number;
  y: number;
  color: string;
  id: number;
}
const InferencePointer = (props: Props) => {
  const { appState: { htmlImageDims } } = useContext(AppContext)!;
  const sharedStyle = {
    backgroundColor: props.color,
    top: props.y * htmlImageDims.height + htmlImageDims.y - 16,
    left: props.x * htmlImageDims.width + htmlImageDims.x - 16,
  };
  return (
    <div>
      <span
        className='absolute w-8 h-8 mr-4 rounded-full opacity-100 pointer-events-none animate-ping'
        style={sharedStyle}
      />
      <CgSpinnerTwoAlt
        className='absolute w-8 h-8 bg-green-400 rounded-full opacity-100 pointer-events-none animate-spin'
        style={sharedStyle}
      />
    </div>
  );
};

export default InferencePointer;
