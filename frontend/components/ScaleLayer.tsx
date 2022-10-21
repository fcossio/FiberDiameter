import { Line } from "../types";
import FiberLayer from "./FiberLayer";

interface Props {
  measurement: Line;
  color: string;
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
      onChange={props.onChange}
      measureLine={props.measureLine}
      measureCircle={props.measureCircle}
      disableRemoveButton
    />
  );
};

export default ScaleLayer;
