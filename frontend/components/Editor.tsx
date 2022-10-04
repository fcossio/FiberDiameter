import React, { FunctionComponent, useState} from 'react'

import dynamic from "next/dynamic";

const MeasuredImage = dynamic(() => import('./MeasuredImage'), { ssr: false });

interface Props {

}

const Editor: FunctionComponent<Props> = (props) => {
  const [state, setState] = useState({
    loaded: false,
  });
   const onImageLoaded = () => setState({ ...state, loaded: true });

  return (
    <div>
      <MeasuredImage onImageLoaded={onImageLoaded} />
    </div>
  );
}

export default Editor