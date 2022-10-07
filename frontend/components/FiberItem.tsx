import React from "react";
import Item from "./Item";

export interface Props {
  id: number;
  color: string;
  diameter: number;
}

const FiberItem = (props: Props) => {
  return (
    <Item>
      <p className=''>{props.id}</p>
      <span
        className='w-4 h-4 border-2'
        style={{
          backgroundColor: `#${props.color}`,
        }}
      ></span>
      <p className=''>{props.diameter}</p>
    </Item>
  );
};

export default FiberItem;
