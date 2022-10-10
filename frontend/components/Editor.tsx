import React from 'react'

import dynamic from "next/dynamic";

const MeasuredImage = dynamic(() => import('./MeasuredImage'), { ssr: false });

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