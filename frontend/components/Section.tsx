import React, { FunctionComponent } from "react";

const Section: FunctionComponent<
  React.ComponentPropsWithoutRef<"div">
> = (props) => {
  return (
    <div className=' text-slate-700'>
          <p className='bg-slate-200 text-slate-700'>{props.title}</p>
      {props.children}
    </div>
  );
};

export default Section;
