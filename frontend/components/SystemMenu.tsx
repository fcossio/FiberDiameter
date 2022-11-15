import React, { useContext } from "react";
import { fibersToCSV } from "../utils";
import { AppContext } from "./App";

const SystemMenu = (props: React.ComponentPropsWithoutRef<"div">) => {
  const { swapImage, fibers, appState: { realDims, magnitude } } = useContext(AppContext)!;

  const downloadCsv = () => {
    // Create CSV
    const csv = fibersToCSV(fibers, realDims, magnitude);
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([csv]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FiberDiameters.csv`);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
  }

  return (
    <div className='flex p-1 text-sm select-none group bg-slate-700'>
      <Tab title='File'>
        <Item htmlFor='select-file'>New</Item>
        <input
          id='select-file'
          type='file'
          className='hidden'
          onChange={swapImage}
        />
        {/* <Item>Open</Item> */}
      </Tab>
      <Tab title='Download'>
        {/* <Item>annotated Image</Item> */}
        <Item htmlFor="download-csv" onClick={downloadCsv}>as CSV</Item>
        {/* <Item>as JSON</Item> */}
      </Tab>
      {/* <Tab title='Edit'>
        <Item>Add Segment</Item>
        <Item>Add Fiber</Item>
        <Item>Set Scale</Item>
      </Tab> */}
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

const Item = (props: React.ComponentPropsWithoutRef<"label">) => {
  return (
    <div className='flex px-1 m-1 rounded-sm hover:bg-slate-600'>
      <label className='w-full cursor-pointer' {...props}>
        {props.children}
      </label>
    </div>
  );
};

export default SystemMenu;
