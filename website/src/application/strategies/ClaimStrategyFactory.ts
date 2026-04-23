import type { ClaimType } from "../../domain/entities/Game";
import type { ClaimStrategy } from "./ClaimStrategy";
import {
  Early5Strategy,
  TopLineStrategy,
  MiddleLineStrategy,
  BottomLineStrategy,
  FullHouseStrategy,
} from "./ClaimStrategy";

export interface IClaimStrategyFactory {
  create(type: ClaimType): ClaimStrategy;
}

export class ClaimStrategyFactory implements IClaimStrategyFactory {
  public create(type: ClaimType): ClaimStrategy {
    switch (type) {
      case "Early5":
        return new Early5Strategy();
      case "TopLine":
        return new TopLineStrategy();
      case "MiddleLine":
        return new MiddleLineStrategy();
      case "BottomLine":
        return new BottomLineStrategy();
      case "FullHouse":
        return new FullHouseStrategy();
      default:
        throw new Error(`Unsupported claim type: ${String(type)}`);
    }
  }
}
