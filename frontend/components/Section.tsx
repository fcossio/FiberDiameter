import React from "react";

const Section = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className={`text-slate-500 ${props.className}`}>
      <p className='pl-2 bg-slate-100 text-slate-700'>{props.title}</p>
      {props.children}
    </div>
  );
};

export default Section;
