import { useState, useEffect } from 'react';
import { GameManager } from '../../infrastructure/GameManager';
import type { GameState } from '../../domain/entities/Game';
import { socketService } from '../../infrastructure/SocketService';

interface ClaimBroadcastPayload {
  playerId: string;
  claimType: "Early5" | "TopLine" | "MiddleLine" | "BottomLine" | "FullHouse";
  isValid: boolean;
}

interface MarkNumberPayload {
  ticketId: string;
  cellId: string;
  isMarked: boolean;
  markedAtCallCount?: number;
}

interface RoomStateSyncPayload {
  code: string;
  status: 'waiting' | 'started';
  tickets: Array<{
    id: string;
    playerId: string;
    cells: Array<Array<{
      id: string;
      value: number | null;
      isMarked: boolean;
      markedAtCallCount?: number;
    }>>;
  }>;
  calledNumbers: number[];
  currentNumber: number | null;
  markedNumbers: MarkNumberPayload[];
}

export const useGameState = (roomId: string) => {
  const [gameState, setGameState] = useState<GameState>(GameManager.getInstance().getState());

  useEffect(() => {
    const manager = GameManager.getInstance();
    
    if (manager.getState().id !== roomId) {
      manager.resetGame(roomId);
    }

    const savedPlayerId = localStorage.getItem('currentPlayerId');
    const isHost = savedPlayerId?.startsWith('host');

    // Join WebSocket Room
    socketService.joinRoom(roomId);

    socketService.on('game_started', () => {
      manager.syncStartGame();
    });

    socketService.on('number_called', (num: number) => {
      manager.syncNumberCalled(num);
    });

    socketService.on('claim_result_broadcast', (data: ClaimBroadcastPayload) => {
      manager.syncClaimResult(data.playerId, data.claimType, data.isValid);
    });

    socketService.on("mark_number_broadcast", (data: MarkNumberPayload) => {
      manager.syncMarkNumber(data.ticketId, data.cellId, data.isMarked, data.markedAtCallCount);
    });

    socketService.on('room_state_sync', (data: RoomStateSyncPayload) => {
      if (data.code !== roomId) return;
      manager.hydrateFromServerState({
        status: data.status,
        tickets: data.tickets,
        calledNumbers: data.calledNumbers,
        markedNumbers: data.markedNumbers
      });
    });

    socketService.on('player_joined', () => {
       // A placeholder if you decide to update participants dynamically in game
       console.log('A player joined the game room!');
    });

    // Auto-add a default player if not exists (for local testing purposes)
    if (manager.getState().players.length === 0) {
      if (savedPlayerId) {
         manager.addPlayer(isHost ? "Local Host" : "Local Player", savedPlayerId);
      } else {
         manager.addPlayer("Local Player 1");
      }
    }

    const unsubscribe = manager.subscribe((state) => {
      // Create a shallow copy to ensure React re-renders,
      // as GameManager mutates the state object internally.
      setGameState({ ...state });
    });
    
    return () => {
       unsubscribe();
       socketService.off('game_started');
       socketService.off('number_called');
       socketService.off('claim_result_broadcast');
       socketService.off("mark_number_broadcast");
       socketService.off('room_state_sync');
       socketService.off('player_joined');
    };
  }, [roomId]);

  return gameState;
};
