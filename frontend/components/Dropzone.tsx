import React, { useContext } from "react";
import { AppContext } from "./App";

const Dropzone = () => {
  const { setAppState, swapImage } = useContext(AppContext)!;

  return (
    <div className='flex flex-col justify-center w-full h-full bg-slate-700'>
      <label
        htmlFor='dropzone-file'
        className='flex flex-col items-center self-center justify-center w-full max-w-3xl m-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer min-w-max h-96 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
      >
        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
          <svg
            aria-hidden='true'
            className='w-10 h-10 mb-3 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            {/* <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
            ></path> */}
          </svg>
          <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
            <span className='font-semibold'>Click to open</span> or drag and
            drop
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            PNG or JPG images only.
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            (Your images are processed locally and never leave the browser)
          </p>
        </div>
        <input
          id='dropzone-file'
          type='file'
          className='hidden'
          onChange={swapImage}
        />
      </label>
      <button
        className='self-center w-64 btn'
        onClick={() =>
          setAppState((prevState) => ({
            ...prevState,
            imagePath: "/images/fibers.png",
          }))
        }
      >
        or use the test image
      </button>
    </div>
  );
};

export default Dropzone;
