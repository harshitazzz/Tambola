import type { Ticket } from "../../domain/entities/Ticket";
import type { Cell } from "../../domain/entities/Cell";

export interface ClaimStrategy {
  validate(ticket: Ticket, currentCallCount: number): boolean;
}

function completedOnCurrentCall(cells: Cell[], currentCallCount: number): boolean {
  const markedCells = cells.filter((cell) => cell.value !== null);
  if (markedCells.length === 0 || markedCells.some((cell) => !cell.isMarked)) {
    return false;
  }

  return Math.max(...markedCells.map((cell) => cell.markedAtCallCount ?? 0)) === currentCallCount;
}

export class Early5Strategy implements ClaimStrategy {
  validate(ticket: Ticket, currentCallCount: number): boolean {
    const markedCells = ticket.cells
      .flat()
      .filter((cell) => cell.value !== null && cell.isMarked);

    if (markedCells.length < 5) return false;

    const sortedMarkTimes = markedCells
      .map((cell) => cell.markedAtCallCount ?? 0)
      .sort((a, b) => a - b);

    return sortedMarkTimes[4] === currentCallCount;
  }
}

class RowStrategy implements ClaimStrategy {
  private rowIndex: number;
  
  constructor(rowIndex: number) {
    this.rowIndex = rowIndex;
  }

  validate(ticket: Ticket, currentCallCount: number): boolean {
    return completedOnCurrentCall(ticket.cells[this.rowIndex], currentCallCount);
  }
}

export class TopLineStrategy extends RowStrategy {
  constructor() { super(0); }
}

export class MiddleLineStrategy extends RowStrategy {
  constructor() { super(1); }
}

export class BottomLineStrategy extends RowStrategy {
  constructor() { super(2); }
}

export class FullHouseStrategy implements ClaimStrategy {
  validate(ticket: Ticket, currentCallCount: number): boolean {
    return completedOnCurrentCall(ticket.cells.flat(), currentCallCount);
  }
}
