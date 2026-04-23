import type { Ticket } from "../../domain/entities/Ticket";

export interface MarkNumberResult {
  ticket: Ticket;
  updated: boolean;
  markedValue: number | null;
}

export interface IMarkNumberUseCase {
  execute(ticket: Ticket, cellId: string, calledNumbers: number[]): MarkNumberResult;
}

export class MarkNumberUseCase implements IMarkNumberUseCase {
  public execute(ticket: Ticket, cellId: string, calledNumbers: number[]): MarkNumberResult {
    let updated = false;
    let markedValue: number | null = null;

    const cells = ticket.cells.map((row) =>
      row.map((cell) => {
        if (cell.id !== cellId || cell.value === null) {
          return cell;
        }

        if (!calledNumbers.includes(cell.value)) {
          return cell;
        }

        updated = true;
        markedValue = cell.value;

        if (cell.isMarked) {
          return { ...cell, isMarked: false, markedAtCallCount: undefined };
        }

        return { ...cell, isMarked: true, markedAtCallCount: calledNumbers.indexOf(cell.value) + 1 };
      })
    );

    return {
      ticket: updated ? { ...ticket, cells } : ticket,
      updated,
      markedValue,
    };
  }
}
