import React, { FunctionComponent, useState } from 'react'
import {
    MeasurementLayer,
    calculateDistance,
    calculateArea,
} from "react-measurements";

interface Props {

}

const Editor: FunctionComponent<Props> = (props) => {
    const [state, setState] = useState  ([]);

    const onChange = (measurements) => setState({ ...state, measurements });

    const measureLine = (line) =>
      Math.round(calculateDistance(line, 100, 100)) + " mm";

    const measureCircle = (circle) =>
        Math.round(calculateArea(circle, 100, 100)) + " mm²";
    
  return (
    <div
      style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        backgroundColor: "#1a1a1a",
        fontFamily: "sans-serif",
      }}
    >
      <MeasurementLayer
        measurements={state.measurements}
        widthInPx={300}
        heightInPx={300}
        onChange={onChange}
        measureLine={measureLine}
        measureCircle={measureCircle}
      />
    </div>
  );
}

export default Editor