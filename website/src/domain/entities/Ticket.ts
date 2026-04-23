import type { Cell } from "./Cell";

export interface Ticket {
  id: string;
  playerId: string;
  cells: Cell[][]; // 3 rows x 9 columns
}
