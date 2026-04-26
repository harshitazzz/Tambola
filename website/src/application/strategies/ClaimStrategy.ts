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

export class CornersStrategy implements ClaimStrategy {
  validate(ticket: Ticket, currentCallCount: number): boolean {
    // Top row is index 0, bottom row is index 2
    const topRow = ticket.cells[0];
    const bottomRow = ticket.cells[2];

    const corners: Cell[] = [];
    
    // Find first and last cell of top row
    const topCells = topRow.filter(cell => cell.value !== null);
    if (topCells.length > 0) {
      corners.push(topCells[0], topCells[topCells.length - 1]);
    }

    // Find first and last cell of bottom row
    const bottomCells = bottomRow.filter(cell => cell.value !== null);
    if (bottomCells.length > 0) {
      corners.push(bottomCells[0], bottomCells[bottomCells.length - 1]);
    }

    // Must have exactly 4 corners and all must be marked
    if (corners.length !== 4 || corners.some(cell => !cell.isMarked)) {
      return false;
    }

    // The max markedAtCallCount among the 4 corners must equal the currentCallCount
    const maxCallCount = Math.max(...corners.map(cell => cell.markedAtCallCount ?? 0));
    return maxCallCount === currentCallCount;
  }
}

export class BigSmallStrategy implements ClaimStrategy {
  validate(ticket: Ticket, currentCallCount: number): boolean {
    const allCells = ticket.cells.flat().filter(cell => cell.value !== null);
    if (allCells.length === 0) return false;

    let minCell = allCells[0];
    let maxCell = allCells[0];

    for (const cell of allCells) {
      if (cell.value! < minCell.value!) minCell = cell;
      if (cell.value! > maxCell.value!) maxCell = cell;
    }

    if (!minCell.isMarked || !maxCell.isMarked) {
      return false;
    }

    const maxCallCount = Math.max(minCell.markedAtCallCount ?? 0, maxCell.markedAtCallCount ?? 0);
    return maxCallCount === currentCallCount;
  }
}
