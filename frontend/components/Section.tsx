import React, { FunctionComponent } from "react";

const Section: FunctionComponent<
  React.ComponentPropsWithoutRef<"div">
> = (props) => {
  return (
    <div className=' text-slate-500'>
          <p className='bg-slate-100 text-slate-700'>{props.title}</p>
      {props.children}
    </div>
  );
};

export default Section;
