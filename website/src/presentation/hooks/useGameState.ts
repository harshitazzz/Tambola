import { useState, useEffect } from 'react';
import { GameManager } from '../../infrastructure/GameManager';
import type { GameState } from '../../domain/entities/Game';
import { socketService } from '../../infrastructure/SocketService';

interface ClaimBroadcastPayload {
  playerId: string;
  claimType: string;
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
  players: Array<{
    id: string;
    name: string;
  }>;
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

    // Set the room ID in the manager so all socket emits use the correct room code
    manager.setRoomId(roomId);

    // Join WebSocket Room
    socketService.joinRoom(roomId, savedPlayerId ?? undefined);

    const onGameStarted = () => manager.syncStartGame();
    const onNumberCalled = (num: number) => manager.syncNumberCalled(num);
    const onClaimResult = (data: ClaimBroadcastPayload) => manager.syncClaimResult(data.playerId, data.claimType, data.isValid);
    const onMarkNumber = (data: MarkNumberPayload) => manager.syncMarkNumber(data.ticketId, data.cellId, data.isMarked, data.markedAtCallCount);
    const onRoomStateSync = (data: RoomStateSyncPayload) => {
      if (data.code !== roomId) return;
      manager.hydrateFromServerState({
        status: data.status,
        players: data.players,
        tickets: data.tickets,
        calledNumbers: data.calledNumbers,
        markedNumbers: data.markedNumbers
      });
    };
    const onPlayerJoined = () => {
      console.log('A player joined the game room!');
      manager.refreshRoomState();
    };
    const onPlayerLeft = (playerId: string) => {
      manager.syncPlayerLeft(playerId);
      console.log('A player left the game room!');
    };
    const onPlayerFinished = (data: { playerId: string, rank: number }) => {
      manager.syncPlayerFinished(data.playerId, data.rank);
      console.log(`Player ${data.playerId} finished with rank ${data.rank}`);
    };

    socketService.on('game_started', onGameStarted);
    socketService.on('number_called', onNumberCalled);
    socketService.on('claim_result_broadcast', onClaimResult);
    socketService.on("mark_number_broadcast", onMarkNumber);
    socketService.on('room_state_sync', onRoomStateSync);
    socketService.on('player_joined', onPlayerJoined);
    socketService.on('player_left', onPlayerLeft);
    socketService.on('player_finished_broadcast', onPlayerFinished);

    // Ensure the local player has a ticket, or generate one
    if (savedPlayerId) {
      // Small timeout to allow hydrateFromServerState to finish if it's currently processing
      setTimeout(() => {
        manager.ensureLocalPlayerHasTicket(savedPlayerId, isHost ? "Local Host" : "Local Player");
      }, 50);
    }

    const unsubscribe = manager.subscribe((state) => {
      // Create a shallow copy to ensure React re-renders,
      // as GameManager mutates the state object internally.
      setGameState({ ...state });
    });

    return () => {
      unsubscribe();
      socketService.off('game_started', onGameStarted);
      socketService.off('number_called', onNumberCalled);
      socketService.off('claim_result_broadcast', onClaimResult);
      socketService.off("mark_number_broadcast", onMarkNumber);
      socketService.off('room_state_sync', onRoomStateSync);
      socketService.off('player_joined', onPlayerJoined);
      socketService.off('player_left', onPlayerLeft);
      socketService.off('player_finished_broadcast', onPlayerFinished);
      socketService.disconnect();
    };
  }, [roomId]);

  return gameState;
};
