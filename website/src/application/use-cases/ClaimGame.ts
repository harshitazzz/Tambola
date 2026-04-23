import type { ClaimType } from "../../domain/entities/Game";
import type { Ticket } from "../../domain/entities/Ticket";
import type { IClaimStrategyFactory } from "../strategies/ClaimStrategyFactory";

export interface ClaimGameInput {
  ticket: Ticket;
  claimType: ClaimType;
  hasValidWinner: boolean;
  currentCallCount: number;
}

export interface ClaimGameResult {
  isValid: boolean;
}

export interface IClaimGameUseCase {
  execute(input: ClaimGameInput): ClaimGameResult;
}

export class ClaimGameUseCase implements IClaimGameUseCase {
  private readonly strategyFactory: IClaimStrategyFactory;

  constructor(strategyFactory: IClaimStrategyFactory) {
    this.strategyFactory = strategyFactory;
  }

  public execute(input: ClaimGameInput): ClaimGameResult {
    if (input.hasValidWinner) {
      return { isValid: false };
    }

    const strategy = this.strategyFactory.create(input.claimType);
    return { isValid: strategy.validate(input.ticket, input.currentCallCount) };
  }
}
