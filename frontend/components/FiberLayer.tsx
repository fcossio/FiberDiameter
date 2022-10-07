import React from "react";

import { MeasurementLayer } from "@coszio/react-measurements";

interface Props {
  fiberId: number;
  measurements: {
        id: number,
        type: string,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
  }[];
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

const FiberLayer = (props: Props) => {
  return (
    <div
      id={`layer${props.fiberId}`}
      className='absolute pointer-events-none'
      style={{
        width: `${props.imageDims.width}px`,
        height: `${props.imageDims.height}px`,
        top: `${props.imageDims.y}px`,
        left: `${props.imageDims.x}px`,
      }}
    >
      <MeasurementLayer
        measurements={props.measurements}
        widthInPx={props.imageDims.width}
        heightInPx={props.imageDims.height}
        onChange={props.onChange}
        measureLine={props.measureLine}
        measureCircle={props.measureCircle}
      />

      {/* --------  Customize react-measurements style  --------*/}
      <style jsx>
        {`
          /* ---- Lines, circles, annotations ---- */

          :global(#layer${props.fiberId}
              .line-measurement
              .line, .circle-measurement .circle, .text-annotation
              .arrow-line) {
            stroke: ${props.color};
          }

          :global(#layer${props.fiberId} .text-annotation .arrow-head) {
            fill: ${props.color};
          }

          /* ---- disable button bar ---- */
          :global(.measurement-layer:hover .button-bar) {
            opacity: 0;
          }
        `}
      </style>
    </div>
  );
};

export default FiberLayer;
