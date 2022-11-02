export interface Fiber {
  id: number;
  color: string;
  average: number;
  measurements: Line[];
}

export interface Line {
  id: number;
  type: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}