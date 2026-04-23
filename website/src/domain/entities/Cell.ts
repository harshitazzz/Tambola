export interface Cell {
  id: string; // row-col
  value: number | null; // null for blank spaces
  isMarked: boolean;
  markedAtCallCount?: number;
}
