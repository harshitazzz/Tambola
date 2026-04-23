"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const Room_1 = require("../models/Room");
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
    createRoom(settings) {
        const code = this.generateUniqueCode();
        const newRoom = new Room_1.Room(code, settings);
        this.rooms.set(code, newRoom);
        return newRoom;
    }
    getRoom(code) {
        return this.rooms.get(code.toUpperCase());
    }
    joinRoom(code, playerName, playerId) {
        const room = this.getRoom(code);
        if (!room)
            return null;
        room.addPlayer({ id: playerId, name: playerName });
        return room;
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
