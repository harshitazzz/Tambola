import type { GameState, ClaimType, Claim } from "../domain/entities/Game";
import type { Player } from "../domain/entities/Player";
import { GenerateTicketUseCase } from "../application/use-cases/GenerateTicket";
import { CallNextNumberUseCase } from "../application/use-cases/CallNextNumber";
import { MarkNumberUseCase } from "../application/use-cases/MarkNumber";
import { ClaimGameUseCase } from "../application/use-cases/ClaimGame";
import { ClaimStrategyFactory } from "../application/strategies/ClaimStrategyFactory";
import { SoundService } from "./SoundService";
import { socketService } from "./SocketService";
import type { Ticket } from "../domain/entities/Ticket";

type Listener = (state: GameState) => void;
type PlayStatus = "Waiting" | "Playing" | "Finished";

export class GameManager {
  private static instance: GameManager;
  private state: GameState;
  private listeners: Listener[] = [];
  private availableNumbers: number[] = [];
  private readonly generateTicketUseCase = new GenerateTicketUseCase();
  private readonly callNextNumberUseCase = new CallNextNumberUseCase();
  private readonly markNumberUseCase = new MarkNumberUseCase();
  private readonly claimGameUseCase = new ClaimGameUseCase(new ClaimStrategyFactory());

  private constructor() {
    this.state = {
      id: "game-" + Date.now(),
      status: "Waiting",
      players: [],
      tickets: [],
      calledNumbers: [],
      claims: []
    };
    this.resetNumbers();
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public resetGame(newRoomId?: string) {
    this.state = {
      id: newRoomId || "game-" + Date.now(),
      status: "Waiting",
      players: [],
      tickets: [],
      calledNumbers: [],
      claims: []
    };
    this.resetNumbers();
    this.notify();
  }

  // Observer Pattern Implementation
  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.state); // send initial state immediately
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): GameState {
    return this.state;
  }

  // Use Cases
  public addPlayer(name: string, id?: string): Player {
    const player: Player = { id: id || "p-" + Date.now(), name };
    this.state.players.push(player);
    
    const ticketId = "t-" + Date.now();
    const ticket = this.generateTicketUseCase.execute(player.id, ticketId);
    this.state.tickets.push(ticket);
    socketService.emit("sync_ticket", { code: this.state.id, ticket });

    this.notify();
    return player;
  }

  public ensureLocalPlayerHasTicket(playerId: string, fallbackName: string): void {
    let player = this.state.players.find(p => p.id === playerId);
    if (!player) {
      player = { id: playerId, name: fallbackName };
      this.state.players.push(player);
    }
    
    const hasTicket = this.state.tickets.some(t => t.playerId === playerId);
    if (!hasTicket) {
      const ticketId = "t-" + Date.now();
      const ticket = this.generateTicketUseCase.execute(player.id, ticketId);
      this.state.tickets.push(ticket);
      socketService.emit("sync_ticket", { code: this.state.id, ticket });
      this.notify();
    }
  }

  public startGame() {
    this.state.status = "Playing";
    this.state.calledNumbers = [];
    this.state.claims = [];
    this.resetNumbers();
    socketService.emit('start_game', this.state.id);
    this.notify();
  }

  private resetNumbers() {
    this.availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    // Fisher-Yates Shuffle for unbiased randomness
    for (let i = this.availableNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.availableNumbers[i], this.availableNumbers[j]] = [this.availableNumbers[j], this.availableNumbers[i]];
    }
  }

  public callNextNumber(): number | null {
    const result = this.callNextNumberUseCase.execute({
      status: this.state.status,
      availableNumbers: this.availableNumbers,
      calledNumbers: this.state.calledNumbers
    });
    if (result.calledNumber === null) return null;

    this.availableNumbers = result.remainingNumbers;
    this.state = {
      ...this.state,
      status: result.nextStatus,
      calledNumbers: [...this.state.calledNumbers, result.calledNumber]
    };
    SoundService.playCallSound(result.calledNumber);

    socketService.emit('call_number', { code: this.state.id, number: result.calledNumber });
    this.notify();
    return result.calledNumber;
  }

  public markNumber(ticketId: string, cellId: string) {
    const ticketIndex = this.state.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = this.state.tickets[ticketIndex];
    const markResult = this.markNumberUseCase.execute(ticket, cellId, this.state.calledNumbers);

    if (markResult.updated) {
      this.state.tickets[ticketIndex] = markResult.ticket;
      SoundService.playMarkSound();
      socketService.emit("mark_number", {
        code: this.state.id,
        ticketId,
        cellId,
        ...this.getCellMarkState(ticketId, cellId)
      });
      this.notify();
    }
  }

  public claim(playerId: string, type: ClaimType): boolean {
    const playerTickets = this.state.tickets.filter(t => t.playerId === playerId);
    if (playerTickets.length === 0) return false;

    const ticket = playerTickets[0];
    const alreadyClaimed = this.state.claims.find(c => c.type === type && c.isValid);
    const result = this.claimGameUseCase.execute({
      ticket,
      claimType: type,
      hasValidWinner: alreadyClaimed !== undefined,
      currentCallCount: this.state.calledNumbers.length
    });
    const isValid = result.isValid;
    const claimRecord: Claim = { playerId, type, isValid };
    this.state.claims.push(claimRecord);
    
    if (isValid) {
        SoundService.playWinSound();
    }

    socketService.emit('claim_result', { code: this.state.id, playerId, claimType: type, isValid });

    this.notify();
    return isValid;
  }

  // --- Synchronization Methods for Replicas ---
  public syncStartGame() {
    this.state = {
      ...this.state,
      status: "Playing",
      calledNumbers: [],
      claims: []
    };
    this.notify();
  }

  public syncNumberCalled(num: number) {
    if (!this.state.calledNumbers.includes(num)) {
      const newCalledNumbers = [...this.state.calledNumbers, num];
      // Remove from available so we don't accidentally call it if we become host somehow
      this.availableNumbers = this.availableNumbers.filter(n => n !== num);
      
      this.state = {
        ...this.state,
        calledNumbers: newCalledNumbers,
        status: this.availableNumbers.length === 0 ? "Finished" : this.state.status
      };

      SoundService.playCallSound(num);
      this.notify();
    }
  }

  public syncClaimResult(playerId: string, type: ClaimType, isValid: boolean) {
    const exists = this.state.claims.find(c => c.playerId === playerId && c.type === type && c.isValid === isValid);
    if (!exists) {
       this.state.claims.push({ playerId, type, isValid });
       if (isValid) SoundService.playWinSound();
       this.notify();
    }
  }

  public syncMarkNumber(ticketId: string, cellId: string, isMarked: boolean, markedAtCallCount?: number) {
    const ticketIndex = this.state.tickets.findIndex((ticket) => ticket.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = this.state.tickets[ticketIndex];
    const nextCells = ticket.cells.map((row) =>
      row.map((cell) => {
        if (cell.id !== cellId || cell.value === null) {
          return cell;
        }
        return {
          ...cell,
          isMarked,
          markedAtCallCount: isMarked ? markedAtCallCount : undefined,
        };
      })
    );

    this.state.tickets[ticketIndex] = { ...ticket, cells: nextCells };
    this.notify();
  }

  public hydrateFromServerState(payload: {
    status: "waiting" | "started";
    players?: Player[];
    tickets: Ticket[];
    calledNumbers: number[];
    markedNumbers: Array<{
      ticketId: string;
      cellId: string;
      isMarked: boolean;
      markedAtCallCount?: number;
    }>;
  }) {
    const nextStatus: PlayStatus = payload.status === "started"
      ? (payload.calledNumbers.length >= 90 ? "Finished" : "Playing")
      : "Waiting";

    const mergedTickets = [...this.state.tickets];
    payload.tickets.forEach(serverTicket => {
      const idx = mergedTickets.findIndex(t => t.id === serverTicket.id);
      if (idx >= 0) {
        mergedTickets[idx] = serverTicket;
      } else {
        mergedTickets.push(serverTicket);
      }
    });

    const mergedPlayers = [...this.state.players];
    if (payload.players) {
      payload.players.forEach(serverPlayer => {
        const idx = mergedPlayers.findIndex(p => p.id === serverPlayer.id);
        if (idx >= 0) {
          mergedPlayers[idx] = serverPlayer;
        } else {
          mergedPlayers.push(serverPlayer);
        }
      });
    }

    this.state = {
      ...this.state,
      status: nextStatus,
      players: mergedPlayers,
      tickets: mergedTickets,
      calledNumbers: [...payload.calledNumbers]
    };

    this.availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
      (num) => !payload.calledNumbers.includes(num)
    );
    // Fisher-Yates shuffle so subsequent calls are random
    for (let i = this.availableNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.availableNumbers[i], this.availableNumbers[j]] = [this.availableNumbers[j], this.availableNumbers[i]];
    }

    payload.markedNumbers.forEach((marked) => {
      this.syncMarkNumber(marked.ticketId, marked.cellId, marked.isMarked, marked.markedAtCallCount);
    });

    this.notify();
  }

  private getCellMarkState(ticketId: string, cellId: string): { isMarked: boolean; markedAtCallCount?: number } {
    const ticket = this.state.tickets.find((entry) => entry.id === ticketId);
    if (!ticket) return { isMarked: false };
    const row = ticket.cells.find((cells) => cells.some((cell) => cell.id === cellId));
    const cell = row?.find((entry) => entry.id === cellId);
    return {
      isMarked: cell?.isMarked ?? false,
      markedAtCallCount: cell?.markedAtCallCount,
    };
  }
}
