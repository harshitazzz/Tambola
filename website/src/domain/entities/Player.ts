export interface Player {
  id: string;
  name: string;
  isFinished?: boolean;
  finishedRank?: number;
  hasLeft?: boolean;
}
