import { useState, useEffect } from "react";
import { GameManager } from "../../infrastructure/GameManager";
import type { GameState } from "../../domain/entities/Game";

export function useGameState(): GameState {
  const manager = GameManager.getInstance();
  const [state, setState] = useState<GameState>(manager.getState());

  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => unsubscribe();
  }, [manager]);

  return state;
}

export function useGameActions() {
  const manager = GameManager.getInstance();
  return {
    addPlayer: (name: string) => manager.addPlayer(name),
    startGame: () => manager.startGame(),
    callNextNumber: () => manager.callNextNumber(),
    markNumber: (ticketId: string, cellId: string) => manager.markNumber(ticketId, cellId),
    claim: (playerId: string, type: import("../../domain/entities/Game").ClaimType) => manager.claim(playerId, type)
  };
}
