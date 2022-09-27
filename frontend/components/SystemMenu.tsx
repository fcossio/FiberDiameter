import React, { FunctionComponent } from "react";

const SystemMenu: FunctionComponent<
  React.ComponentPropsWithoutRef<"div">
> = () => {
  return (
    <div className='flex p-1 text-sm bg-purple-700'>
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
        <Item>Add Segment</Item>
        <Item>Add Fiber</Item>
        <Item>Set Scale</Item>
      </Tab>
    </div>
  );
};

const Tab: FunctionComponent<React.ComponentPropsWithoutRef<"div">> = (
  props
) => {
  return (
    <div className='bg-inherit'>
      <button className='px-2 py-1 rounded-md peer hover:bg-slate-600 focus:bg-slate-600'>
        {props.title}
      </button>
      <div className='absolute hidden w-32 bg-inherit peer-focus:block'>
        {props.children}
      </div>
    </div>
  );
};

const Item: FunctionComponent<React.ComponentPropsWithoutRef<"div">> = (
  props
) => {
  return <div className='m-1 hover:bg-slate-600'>{props.children}</div>;
};

export default SystemMenu;
