import { Room, GameSettings, TicketState } from '../models/Room';
import { RoomStateDocument, RoomStateModel } from '../persistence/RoomStateModel';

const ROOM_TTL_HOURS = Number(process.env.ROOM_TTL_HOURS || 12);
const ROOM_TTL_MS = ROOM_TTL_HOURS * 60 * 60 * 1000;

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

  public async createRoom(settings: GameSettings): Promise<Room> {
    const code = this.generateUniqueCode();
    const newRoom = new Room(code, settings);
    this.rooms.set(code, newRoom);
    await this.persistRoom(newRoom);
    return newRoom;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public async joinRoom(code: string, playerName: string, playerId: string): Promise<Room | null> {
    const room = this.getRoom(code);
    if (!room) return null;

    room.addPlayer({ id: playerId, name: playerName });
    await this.persistRoom(room);
    return room;
  }

  public async startRoom(code: string): Promise<Room | null> {
    const room = this.getRoom(code);
    if (!room) return null;
    room.startGame();
    await this.persistRoom(room);
    return room;
  }

  public async recordCalledNumber(code: string, number: number): Promise<Room | null> {
    const room = this.getRoom(code);
    if (!room) return null;
    room.addCalledNumber(number);
    await this.persistRoom(room);
    return room;
  }

  public async recordMarkedNumber(
    code: string,
    ticketId: string,
    cellId: string,
    isMarked: boolean,
    markedAtCallCount?: number
  ): Promise<Room | null> {
    const room = this.getRoom(code);
    if (!room) return null;

    room.upsertMarkedNumber({ ticketId, cellId, isMarked, markedAtCallCount });
    await this.persistRoom(room);
    return room;
  }

  public async recordTicket(code: string, ticket: TicketState): Promise<Room | null> {
    const room = this.getRoom(code);
    if (!room) return null;
    room.upsertTicket(ticket);
    await this.persistRoom(room);
    return room;
  }

  public async loadActiveRoomsFromDb(): Promise<void> {
    const now = new Date();
    const docs = await RoomStateModel.find({ expiresAt: { $gt: now } }).lean();

    docs.forEach((doc: RoomStateDocument) => {
      const room = Room.fromSnapshot({
        code: doc.roomCode,
        players: doc.players,
        tickets: doc.tickets,
        settings: doc.settings,
        status: doc.status,
        createdAt: new Date(doc.createdAt),
        calledNumbers: doc.calledNumbers,
        currentNumber: doc.currentNumber,
        markedNumbers: doc.markedNumbers
      });
      this.rooms.set(room.getCode(), room);
    });
  }

  private async persistRoom(room: Room): Promise<void> {
    const snapshot = room.toSnapshot();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ROOM_TTL_MS);

    await RoomStateModel.findOneAndUpdate(
      { roomCode: snapshot.code },
      {
        roomCode: snapshot.code,
        players: snapshot.players,
        tickets: snapshot.tickets,
        calledNumbers: snapshot.calledNumbers,
        currentNumber: snapshot.currentNumber,
        markedNumbers: snapshot.markedNumbers,
        settings: snapshot.settings,
        status: snapshot.status,
        createdAt: snapshot.createdAt,
        updatedAt: now,
        expiresAt
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
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
