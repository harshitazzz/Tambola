import { Room, GameSettings } from '../models/Room';

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Room>;

  private constructor() {
    this.rooms = new Map<string, Room>();
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public createRoom(settings: GameSettings): Room {
    const code = this.generateUniqueCode();
    const newRoom = new Room(code, settings);
    this.rooms.set(code, newRoom);
    return newRoom;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public joinRoom(code: string, playerName: string, playerId: string): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;

    room.addPlayer({ id: playerId, name: playerName });
    return room;
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!this.rooms.has(code)) {
        isUnique = true;
      }
    }

    return code;
  }
}
