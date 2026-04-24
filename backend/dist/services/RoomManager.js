"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const Room_1 = require("../models/Room");
const RoomStateModel_1 = require("../persistence/RoomStateModel");
const ROOM_TTL_HOURS = Number(process.env.ROOM_TTL_HOURS || 12);
const ROOM_TTL_MS = ROOM_TTL_HOURS * 60 * 60 * 1000;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    static getInstance() {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }
    async createRoom(settings) {
        const code = this.generateUniqueCode();
        const newRoom = new Room_1.Room(code, settings);
        this.rooms.set(code, newRoom);
        await this.persistRoom(newRoom);
        return newRoom;
    }
    getRoom(code) {
        return this.rooms.get(code.toUpperCase());
    }
    async joinRoom(code, playerName, playerId) {
        const room = this.getRoom(code);
        if (!room)
            return null;
        room.addPlayer({ id: playerId, name: playerName });
        await this.persistRoom(room);
        return room;
    }
    async startRoom(code) {
        const room = this.getRoom(code);
        if (!room)
            return null;
        room.startGame();
        await this.persistRoom(room);
        return room;
    }
    async recordCalledNumber(code, number) {
        const room = this.getRoom(code);
        if (!room)
            return null;
        room.addCalledNumber(number);
        await this.persistRoom(room);
        return room;
    }
    async recordMarkedNumber(code, ticketId, cellId, isMarked, markedAtCallCount) {
        const room = this.getRoom(code);
        if (!room)
            return null;
        room.upsertMarkedNumber({ ticketId, cellId, isMarked, markedAtCallCount });
        await this.persistRoom(room);
        return room;
    }
    async recordTicket(code, ticket) {
        const room = this.getRoom(code);
        if (!room)
            return null;
        room.upsertTicket(ticket);
        await this.persistRoom(room);
        return room;
    }
    async loadActiveRoomsFromDb() {
        const now = new Date();
        const docs = await RoomStateModel_1.RoomStateModel.find({ expiresAt: { $gt: now } }).lean();
        docs.forEach((doc) => {
            const room = Room_1.Room.fromSnapshot({
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
    async persistRoom(room) {
        const snapshot = room.toSnapshot();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ROOM_TTL_MS);
        await RoomStateModel_1.RoomStateModel.findOneAndUpdate({ roomCode: snapshot.code }, {
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
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    generateUniqueCode() {
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
exports.RoomManager = RoomManager;
