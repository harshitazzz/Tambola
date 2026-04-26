import type { ClaimType } from "../../domain/entities/Game";
import type { ClaimStrategy } from "./ClaimStrategy";
import {
  Early5Strategy,
  TopLineStrategy,
  MiddleLineStrategy,
  BottomLineStrategy,
  FullHouseStrategy,
  CornersStrategy,
  BigSmallStrategy,
} from "./ClaimStrategy";

export interface IClaimStrategyFactory {
  create(type: ClaimType): ClaimStrategy;
}

export class ClaimStrategyFactory implements IClaimStrategyFactory {
  public create(type: ClaimType): ClaimStrategy {
    // Extract base type like 'housefull' from 'housefull_2', but preserve 'first_row'
    const baseType = type.replace(/_\d+$/, '');
    switch (baseType) {
      case "early5":
        return new Early5Strategy();
      case "first_row":
        return new TopLineStrategy();
      case "second_row":
        return new MiddleLineStrategy();
      case "third_row":
        return new BottomLineStrategy();
      case "housefull":
        return new FullHouseStrategy();
      case "corners":
        return new CornersStrategy();
      case "big_small":
        return new BigSmallStrategy();
      default:
        throw new Error(`Unsupported claim type: ${String(baseType)}`);
    }
  }
}
