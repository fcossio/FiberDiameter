import React from 'react'

import dynamic from "next/dynamic";

import MeasuredImage from './MeasuredImage';

interface Props {
}

const Editor = (props: Props) => {

  return (
    <div>
      <MeasuredImage/>
    </div>
  );
}

export default Editor