import React, { useContext } from "react";
import Item from "./Item";
import { AiOutlinePlus } from "react-icons/ai";
import { Fiber, Line } from "../types";
import { average } from "../utils";
import { ImageContext } from "./App";
import { calculateDistance } from "@coszio/react-measurements";
import { FaTimes, FaMinus } from "react-icons/fa";
export interface Props {
  addMeasurement: () => void;
  removeFiber: () => void;
}

const FiberItem = (props: Props & Fiber) => {
  const { realDims } = useContext(ImageContext)!;

  const lengths = props.measurements.map((line: Line) =>
    calculateDistance(line, realDims.width, realDims.height)
  );

  const diameter = Math.trunc(average(lengths) * 1000) / 1000;

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
        ></span>
        <p className=''>{diameter}</p>
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
