import mongoose, { Schema } from 'mongoose';
import { GameSettings, Player, RoomStatus } from '../models/Room';

interface MarkedNumberState {
  ticketId: string;
  cellId: string;
  isMarked: boolean;
  markedAtCallCount?: number;
  updatedAt: Date;
}

interface TicketCellState {
  id: string;
  value: number | null;
  isMarked: boolean;
  markedAtCallCount?: number;
}

interface TicketState {
  id: string;
  playerId: string;
  cells: TicketCellState[][];
}

export interface RoomStateDocument {
  roomCode: string;
  players: Player[];
  tickets: TicketState[];
  calledNumbers: number[];
  currentNumber: number | null;
  markedNumbers: MarkedNumberState[];
  settings: GameSettings;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const playerSchema = new Schema<Player>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    isFinished: { type: Boolean, required: false },
    finishedRank: { type: Number, required: false },
    hasLeft: { type: Boolean, required: false }
  },
  { _id: false }
);

const ruleSchema = new Schema(
  {
    name: { type: String, required: true },
    count: { type: Number, required: true },
    points: { type: Number, required: true },
    enabled: { type: Boolean, required: true },
    description: { type: String, required: true }
  },
  { _id: false }
);

const markedNumberSchema = new Schema<MarkedNumberState>(
  {
    ticketId: { type: String, required: true },
    cellId: { type: String, required: true },
    isMarked: { type: Boolean, required: true },
    markedAtCallCount: { type: Number, required: false },
    updatedAt: { type: Date, required: true }
  },
  { _id: false }
);

const ticketCellSchema = new Schema<TicketCellState>(
  {
    id: { type: String, required: true },
    value: { type: Number, required: false, default: null },
    isMarked: { type: Boolean, required: true, default: false },
    markedAtCallCount: { type: Number, required: false }
  },
  { _id: false }
);

const ticketSchema = new Schema<TicketState>(
  {
    id: { type: String, required: true },
    playerId: { type: String, required: true },
    cells: { type: [[ticketCellSchema]], required: true }
  },
  { _id: false }
);

const roomStateSchema = new Schema<RoomStateDocument>(
  {
    roomCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    players: { type: [playerSchema], default: [] },
    tickets: { type: [ticketSchema], default: [] },
    calledNumbers: { type: [Number], default: [] },
    currentNumber: { type: Number, default: null },
    markedNumbers: { type: [markedNumberSchema], default: [] },
    settings: {
      type: {
        callingMethod: { type: String, enum: ['auto', 'manual'], required: true },
        autoInterval: { type: Number, required: false, default: null },
        rules: { type: [ruleSchema], required: true }
      },
      required: true
    },
    status: { type: String, enum: ['waiting', 'started'], required: true, default: 'waiting' },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { versionKey: false }
);

roomStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RoomStateModel = mongoose.model<RoomStateDocument>('RoomState', roomStateSchema);
