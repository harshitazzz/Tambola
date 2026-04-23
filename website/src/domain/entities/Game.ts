import type { Ticket } from "./Ticket";
import type { Player } from "./Player";

export type ClaimType = "Early5" | "TopLine" | "MiddleLine" | "BottomLine" | "FullHouse";

export interface Claim {
  playerId: string;
  type: ClaimType;
  isValid: boolean;
}

export interface GameState {
  id: string;
  status: "Waiting" | "Playing" | "Finished";
  players: Player[];
  tickets: Ticket[];
  calledNumbers: number[];
  claims: Claim[];
}
