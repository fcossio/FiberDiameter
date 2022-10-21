import React, { useContext } from 'react'

import dynamic from "next/dynamic";

import MeasuredImage from './MeasuredImage';
import { AppContext } from './App';
import Dropzone from './Dropzone';

interface Props {
}

const Editor = (props: Props) => {
  const { appState } = useContext(AppContext)!;
  return (
    <div className="h-full">
      {appState.imagePath.length == 0
        ? <Dropzone/>
        : <MeasuredImage/>
    }
    </div>
  );
}

export default Editor