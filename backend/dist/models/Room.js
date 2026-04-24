"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    constructor(code, settings, createdAt) {
        this.code = code;
        this.players = [];
        this.settings = settings;
        this.status = 'waiting';
        this.createdAt = createdAt || new Date();
        this.tickets = [];
        this.calledNumbers = [];
        this.markedNumbers = [];
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
    setStatus(status) {
        this.status = status;
    }
    addPlayer(player) {
        const exists = this.players.find(p => p.id === player.id);
        if (!exists) {
            this.players.push(player);
        }
    }
    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.tickets = this.tickets.filter(ticket => ticket.playerId !== playerId);
    }
    upsertTicket(ticket) {
        const idx = this.tickets.findIndex((entry) => entry.id === ticket.id);
        if (idx >= 0) {
            this.tickets[idx] = ticket;
            return;
        }
        this.tickets.push(ticket);
    }
    getTickets() {
        return this.tickets;
    }
    addCalledNumber(number) {
        if (!this.calledNumbers.includes(number)) {
            this.calledNumbers.push(number);
        }
    }
    getCalledNumbers() {
        return this.calledNumbers;
    }
    getCurrentNumber() {
        return this.calledNumbers.length > 0 ? this.calledNumbers[this.calledNumbers.length - 1] : null;
    }
    upsertMarkedNumber(marked) {
        const existingIndex = this.markedNumbers.findIndex((entry) => entry.ticketId === marked.ticketId && entry.cellId === marked.cellId);
        const nextEntry = {
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
    getMarkedNumbers() {
        return this.markedNumbers;
    }
    getJoinLink() {
        return `http://localhost:5173/join/${this.code}`;
    }
    toSnapshot() {
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
    static fromSnapshot(snapshot) {
        const room = new Room(snapshot.code, snapshot.settings, snapshot.createdAt);
        room.players = snapshot.players;
        room.status = snapshot.status;
        room.tickets = [...snapshot.tickets];
        room.calledNumbers = [...snapshot.calledNumbers];
        room.markedNumbers = [...snapshot.markedNumbers];
        return room;
    }
    toJSON() {
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
exports.Room = Room;
