import React from "react";

const Item = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      className={
        "flex items-center justify-start pl-2 space-x-2 overflow-hidden bg-transparent cursor-pointer hover:bg-slate-200 " +
        props.className
      }
    >
      {props.children}
    </div>
  );
};

export default Item;
