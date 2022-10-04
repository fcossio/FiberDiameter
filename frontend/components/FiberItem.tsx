import React, { FunctionComponent } from "react";

export interface Props {
  id: number;
  color: string;
  diameter: number;
}

const FiberItem: FunctionComponent<Props> = (props) => {
  return (
    <div className='flex justify-start pl-2 space-x-2 overflow-hidden bg-transparent cursor-pointer place-items-center hover:bg-slate-400'>
      <p id='id' className=''>
        {props.id}
      </p>
      <span
        id='icon'
        className='w-4 h-4 border-2'
        style={{
          backgroundColor: `#${props.color}`,
        }}
      />
      <p id='diameter' className=''>
        {props.diameter}
      </p>
    </div>
  );
};

export default FiberItem;
