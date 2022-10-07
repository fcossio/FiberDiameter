import React from 'react'

const Item = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
      <div className='flex items-center justify-start pl-2 space-x-2 overflow-hidden cursor-pointer bg-traparent hover:bg-slate-400'>
          {props.children}
    </div>
  );
};

export default Item