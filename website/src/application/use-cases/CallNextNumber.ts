export interface CallNextNumberInput {
  status: "Waiting" | "Playing" | "Finished";
  availableNumbers: number[];
  calledNumbers: number[];
}

export interface CallNextNumberResult {
  calledNumber: number | null;
  nextStatus: "Waiting" | "Playing" | "Finished";
  remainingNumbers: number[];
}

export interface ICallNextNumberUseCase {
  execute(input: CallNextNumberInput): CallNextNumberResult;
}

export class CallNextNumberUseCase implements ICallNextNumberUseCase {
  public execute(input: CallNextNumberInput): CallNextNumberResult {
    if (input.status !== "Playing" || input.availableNumbers.length === 0) {
      return {
        calledNumber: null,
        nextStatus: input.status,
        remainingNumbers: input.availableNumbers,
      };
    }

    const remainingNumbers = [...input.availableNumbers];
    const calledNumber = remainingNumbers.pop() ?? null;

    return {
      calledNumber,
      nextStatus: remainingNumbers.length === 0 ? "Finished" : "Playing",
      remainingNumbers,
    };
  }
}
