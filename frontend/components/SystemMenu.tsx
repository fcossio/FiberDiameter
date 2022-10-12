import React from "react";

const SystemMenu = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className='flex p-1 text-sm group bg-slate-700'>
      <Tab title='File'>
        <Item>New</Item>
        <Item>Open</Item>
      </Tab>
      <Tab title='Download'>
        <Item>annotated Image</Item>
        <Item>as CSV</Item>
        <Item>as JSON</Item>
      </Tab>
      <Tab title='Edit'>
        {/* <Item>Add Segment</Item> */}
        <Item>Add Fiber</Item>
        <Item>Set Scale</Item>
      </Tab>
    </div>
  );
};

const Tab = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className='bg-inherit group'>
      <button className='px-2 py-1 rounded-md peer hover:bg-slate-600'>
        {props.title}
      </button>
      <div className='absolute z-50 hidden rounded-sm cursor-pointer w-36 drop-shadow bg-inherit group-focus-within:peer-hover:block hover:block'>
        {props.children}
      </div>
    </div>
  );
};

const Item = (props: React.ComponentPropsWithoutRef<"div">) => {
  return <div className='px-1 m-1 rounded-sm hover:bg-slate-600'>{props.children}</div>;
};

export default SystemMenu;
