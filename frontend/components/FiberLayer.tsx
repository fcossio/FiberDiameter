import React, { useContext } from "react";

import { MeasurementLayer } from "@coszio/react-measurements";
import { AppContext } from "./App";
import { Line } from "../types";

interface Props {
  fiberId: number;
  measurements: Line[];
  color: string;
  onChange: (measurements: any) => void;
  measureLine: (line: any) => string;
  measureCircle: (circle: any) => string;
  disableRemoveButton?: boolean;
  textColor?: string;
}

const FiberLayer = (props: Props) => {
  const { appState: { htmlImageDims } } = useContext(AppContext)!;
  return (
    <div
      id={`layer${props.fiberId}`}
      className='absolute pointer-events-none'
      style={{
        width: `${htmlImageDims.width}px`,
        height: `${htmlImageDims.height}px`,
        top: `${htmlImageDims.y}px`,
        left: `${htmlImageDims.x}px`,
      }}
    >
      <MeasurementLayer
        measurements={props.measurements}
        widthInPx={htmlImageDims.width}
        heightInPx={htmlImageDims.height}
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
              .line, #layer${props.fiberId}
              .circle-measurement
              .circle, #layer${props.fiberId} .text-annotation .arrow-line) {
            stroke: ${props.color};
          }

          :global(#layer${props.fiberId} .text-annotation .arrow-head) {
            fill: ${props.color};
          }

          /* ---- text ---- */
          :global(#layer${props.fiberId}
              .measurement-text, #layer${props.fiberId}
              .text-annotation
              .text) {
            color: ${props.textColor ?? "#EEE8AAA0"};
            background-color: rgba(0, 0, 0, 0.5);
          }

          /* ---- disable button bar ---- */
          :global(#layer${props.fiberId} .measurement-layer:hover .button-bar) {
            opacity: 0;
          }

          /* ---- disable remove button ---- */
          :global(#layer${props.fiberId} .delete-button) {
            ${props.disableRemoveButton && "visibility: hidden"}
          }
        `}
      </style>
    </div>
  );
};

export default FiberLayer;
