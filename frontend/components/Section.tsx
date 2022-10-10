import React from "react";

interface Props {
  actions?: React.ReactNode;
}

const Section = (props: Props & React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className={`text-slate-500 ${props.className}`}>
      <div className='flex justify-between w-auto h-6 group bg-slate-100'>
        <p className='pl-2 text-slate-700'>{props.title}</p>
        <div className='hidden group-hover:block'>
          {props.actions}
        </div>
      </div>
      {props.children}
    </div>
  );
};

export default Section;
