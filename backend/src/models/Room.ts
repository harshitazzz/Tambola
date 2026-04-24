export interface Player {
  id: string;
  name: string;
}

export interface Rule {
  name: string;
  count: number;
  points: number;
  enabled: boolean;
  description: string;
}

export interface GameSettings {
  callingMethod: 'auto' | 'manual';
  autoInterval?: 3 | 5 | 7 | null;
  rules: Rule[];
}

export type RoomStatus = 'waiting' | 'started';

export interface MarkedNumber {
  ticketId: string;
  cellId: string;
  isMarked: boolean;
  markedAtCallCount?: number;
  updatedAt: Date;
}

export interface RoomSnapshot {
  code: string;
  players: Player[];
  settings: GameSettings;
  status: RoomStatus;
  createdAt: Date;
  tickets: TicketState[];
  calledNumbers: number[];
  currentNumber: number | null;
  markedNumbers: MarkedNumber[];
}

export interface TicketCellState {
  id: string;
  value: number | null;
  isMarked: boolean;
  markedAtCallCount?: number;
}

export interface TicketState {
  id: string;
  playerId: string;
  cells: TicketCellState[][];
}

export class Room {
  private code: string;
  private players: Player[];
  private settings: GameSettings;
  private status: RoomStatus;
  private createdAt: Date;
  private tickets: TicketState[];
  private calledNumbers: number[];
  private markedNumbers: MarkedNumber[];

  constructor(code: string, settings: GameSettings, createdAt?: Date) {
    this.code = code;
    this.players = [];
    this.settings = settings;
    this.status = 'waiting';
    this.createdAt = createdAt || new Date();
    this.tickets = [];
    this.calledNumbers = [];
    this.markedNumbers = [];
  }

  public getCode(): string {
    return this.code;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getStatus(): RoomStatus {
    return this.status;
  }

  public startGame(): void {
    this.status = 'started';
  }

  public setStatus(status: RoomStatus): void {
    this.status = status;
  }

  public addPlayer(player: Player): void {
    const exists = this.players.find(p => p.id === player.id);
    if (!exists) {
      this.players.push(player);
    }
  }

  public removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId);
    this.tickets = this.tickets.filter(ticket => ticket.playerId !== playerId);
  }

  public upsertTicket(ticket: TicketState): void {
    const idx = this.tickets.findIndex((entry) => entry.id === ticket.id);
    if (idx >= 0) {
      this.tickets[idx] = ticket;
      return;
    }
    this.tickets.push(ticket);
  }

  public getTickets(): TicketState[] {
    return this.tickets;
  }

  public addCalledNumber(number: number): void {
    if (!this.calledNumbers.includes(number)) {
      this.calledNumbers.push(number);
    }
  }

  public getCalledNumbers(): number[] {
    return this.calledNumbers;
  }

  public getCurrentNumber(): number | null {
    return this.calledNumbers.length > 0 ? this.calledNumbers[this.calledNumbers.length - 1] : null;
  }

  public upsertMarkedNumber(marked: Omit<MarkedNumber, 'updatedAt'>): void {
    const existingIndex = this.markedNumbers.findIndex(
      (entry) => entry.ticketId === marked.ticketId && entry.cellId === marked.cellId
    );

    const nextEntry: MarkedNumber = {
      ...marked,
      markedAtCallCount: marked.isMarked ? marked.markedAtCallCount : undefined,
      updatedAt: new Date()
    };

    if (existingIndex >= 0) {
      this.markedNumbers[existingIndex] = nextEntry;
      return;
    }

    this.markedNumbers.push(nextEntry);
  }

  public getMarkedNumbers(): MarkedNumber[] {
    return this.markedNumbers;
  }

  public getJoinLink(): string {
    return `http://localhost:5173/join/${this.code}`;
  }

  public toSnapshot(): RoomSnapshot {
    return {
      code: this.code,
      players: [...this.players],
      settings: this.settings,
      status: this.status,
      createdAt: this.createdAt,
      tickets: [...this.tickets],
      calledNumbers: [...this.calledNumbers],
      currentNumber: this.getCurrentNumber(),
      markedNumbers: [...this.markedNumbers]
    };
  }

  public static fromSnapshot(snapshot: RoomSnapshot): Room {
    const room = new Room(snapshot.code, snapshot.settings, snapshot.createdAt);
    room.players = snapshot.players;
    room.status = snapshot.status;
    room.tickets = [...snapshot.tickets];
    room.calledNumbers = [...snapshot.calledNumbers];
    room.markedNumbers = [...snapshot.markedNumbers];
    return room;
  }

  public toJSON() {
    return {
      code: this.code,
      players: this.players,
      settings: this.settings,
      status: this.status,
      tickets: this.tickets,
      calledNumbers: this.calledNumbers,
      currentNumber: this.getCurrentNumber(),
      markedNumbers: this.markedNumbers,
      joinLink: this.getJoinLink(),
      createdAt: this.createdAt
    };
  }
}
