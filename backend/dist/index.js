"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const db_1 = require("./persistence/db");
const RoomManager_1 = require("./services/RoomManager");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/rooms', roomRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Tambola Backend is running' });
});
const frontendPath = path_1.default.resolve(__dirname, '../../website/dist');
app.use(express_1.default.static(frontendPath));
app.use((req, res, next) => {
    if (req.path.startsWith('/socket.io')) {
        return next();
    }
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const roomManager = RoomManager_1.RoomManager.getInstance();
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('join_room', (code) => {
        socket.join(code);
        console.log(`Socket ${socket.id} joined room: ${code}`);
        const room = roomManager.getRoom(code);
        if (room) {
            socket.emit('room_state_sync', {
                code: room.getCode(),
                status: room.getStatus(),
                players: room.getPlayers(),
                tickets: room.getTickets(),
                calledNumbers: room.getCalledNumbers(),
                currentNumber: room.getCurrentNumber(),
                markedNumbers: room.getMarkedNumbers()
            });
        }
        // Notify others in the room
        socket.to(code).emit('player_joined');
    });
    socket.on('start_game', (code) => {
        void roomManager.startRoom(code);
        io.to(code).emit('game_started');
    });
    socket.on('call_number', async ({ code, number }) => {
        await roomManager.recordCalledNumber(code, number);
        socket.to(code).emit('number_called', number);
    });
    socket.on('mark_number', async ({ code, ticketId, cellId, isMarked, markedAtCallCount }) => {
        await roomManager.recordMarkedNumber(code, ticketId, cellId, isMarked, markedAtCallCount);
        socket.to(code).emit('mark_number_broadcast', { ticketId, cellId, isMarked, markedAtCallCount });
    });
    socket.on('sync_ticket', async ({ code, ticket }) => {
        await roomManager.recordTicket(code, ticket);
    });
    socket.on('claim', ({ code, playerId, claimType }) => {
        socket.to(code).emit('player_claim', { playerId, claimType });
    });
    socket.on('claim_result', ({ code, playerId, claimType, isValid }) => {
        io.to(code).emit('claim_result_broadcast', { playerId, claimType, isValid });
    });
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
async function startServer() {
    await (0, db_1.connectToDatabase)();
    await roomManager.loadActiveRoomsFromDb();
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
