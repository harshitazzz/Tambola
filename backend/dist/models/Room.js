"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    constructor(code, settings) {
        this.code = code;
        this.players = [];
        this.settings = settings;
        this.status = 'waiting';
        this.createdAt = new Date();
    }
    getCode() {
        return this.code;
    }
    getPlayers() {
        return this.players;
    }
    getStatus() {
        return this.status;
    }
    startGame() {
        this.status = 'started';
    }
    addPlayer(player) {
        const exists = this.players.find(p => p.id === player.id);
        if (!exists) {
            this.players.push(player);
        }
    }
    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
    }
    getJoinLink() {
        return `http://localhost:5173/join/${this.code}`;
    }
    toJSON() {
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
exports.Room = Room;
