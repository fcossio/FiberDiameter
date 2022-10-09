interface Fiber {
  id: number;
  color: string;
  diameter: number;
  measurements: {
    id: number;
    type: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }[];
}

export default Fiber;
