import React from "react";

import FiberLayer from "./FiberLayer";

interface Props {
  measurement: {
    id: number;
    type: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  color: string;
  imageDims: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  onChange: (measurements: any) => void;
  measureLine: (line: any) => string;
  measureCircle: (circle: any) => string;
}

const ScaleLayer = (props: Props) => {
  return (
    <FiberLayer
      fiberId={-1}
      measurements={[props.measurement]}
      color={props.color}
      imageDims={props.imageDims}
      onChange={props.onChange}
      measureLine={props.measureLine}
      measureCircle={props.measureCircle}
    />
  );
};

export default ScaleLayer;
