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

export class Room {
  private code: string;
  private players: Player[];
  private settings: GameSettings;
  private status: RoomStatus;
  private createdAt: Date;

  constructor(code: string, settings: GameSettings) {
    this.code = code;
    this.players = [];
    this.settings = settings;
    this.status = 'waiting';
    this.createdAt = new Date();
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

  public addPlayer(player: Player): void {
    const exists = this.players.find(p => p.id === player.id);
    if (!exists) {
      this.players.push(player);
    }
  }

  public removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId);
  }

  public getJoinLink(): string {
    return `http://localhost:5173/join/${this.code}`;
  }

  public toJSON() {
    return {
      code: this.code,
      players: this.players,
      settings: this.settings,
      status: this.status,
      joinLink: this.getJoinLink(),
      createdAt: this.createdAt
    };
  }
}
