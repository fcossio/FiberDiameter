import { calculateDistance } from "@coszio/react-measurements";
import { useContext, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import { Fiber, Line } from "../types";
import { average } from "../utils";
import { AppContext } from "./App";
import Item from "./Item";
export interface Props {
  addMeasurement: () => void;
  removeFiber: () => void;
}

const FiberItem = (props: Props & Fiber) => {
  const {
    appState: { realDims },
    setFibers
  } = useContext(AppContext)!;

  useEffect(() => {
    const lengths = props.measurements.map((line: Line) =>
    calculateDistance(line, realDims.width, realDims.height)
    );
    
    const diameter = Math.trunc(average(lengths) * 1000) / 1000;
    
    setFibers(prevFibers => {
      const idx = prevFibers.findIndex(fiber => fiber.id == props.id)
      prevFibers[idx].average = diameter
      return [...prevFibers]
    })
    
  }, [props.measurements, realDims, props.id, setFibers])
    
  return (
    <Item className='justify-between h-6 group'>
      <Item className='-ml-3'>
        <div className='flex' title='Delete fiber'>
          <button className='invisible group-hover:visible btn btn-xs btn-square btn-ghost peer '>
            <FaTimes className='' />
          </button>
          <button
            onClick={props.removeFiber}
            className='hidden btn btn-danger btn-xs btn-error group-hover:peer-focus:block active:block '
          >
            Delete
          </button>
        </div>
        <p className='text-xs'>{props.id}</p>
        <span
          className='w-4 h-4 border-2'
          style={{
            backgroundColor: props.color,
          }}
        />
        <p className=''>{props.average}</p>
      </Item>
      <Item className='hidden group-hover:block'>
        <button
          className='btn btn-xs btn-square btn-ghost'
          title='Add measurement'
          onClick={props.addMeasurement}
        >
          <AiOutlinePlus className='' />
        </button>
      </Item>
    </Item>
  );
};

export default FiberItem;
