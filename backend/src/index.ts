import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import roomRoutes from './routes/roomRoutes';
import { connectToDatabase } from './persistence/db';
import { RoomManager } from './services/RoomManager';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Tambola Backend is running' });
});

const frontendPath = path.resolve(__dirname, '../../website/dist');
app.use(express.static(frontendPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

interface CallNumberPayload {
  code: string;
  number: number;
}

interface MarkNumberPayload {
  code: string;
  ticketId: string;
  cellId: string;
  isMarked: boolean;
  markedAtCallCount?: number;
}

interface TicketCellPayload {
  id: string;
  value: number | null;
  isMarked: boolean;
  markedAtCallCount?: number;
}

interface SyncTicketPayload {
  code: string;
  ticket: {
    id: string;
    playerId: string;
    cells: TicketCellPayload[][];
  };
}

interface ClaimPayload {
  code: string;
  playerId: string;
  claimType: string;
}

interface ClaimResultPayload extends ClaimPayload {
  isValid: boolean;
}

interface SocketData {
  code: string;
  playerId?: string;
}

const socketDataMap = new Map<string, SocketData>();
const roomManager = RoomManager.getInstance();

io.on('connection', (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', (data: { code: string; playerId?: string } | string) => {
    // Handle both old format (string code) and new format (object)
    const code = typeof data === 'string' ? data : data.code;
    const playerId = typeof data === 'string' ? undefined : data.playerId;

    socket.join(code);
    console.log(`Socket ${socket.id} joined room: ${code}`);
    socketDataMap.set(socket.id, { code, playerId });

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

  socket.on('start_game', (code: string) => {
    console.log(`[Socket] Received start_game for code: ${code}`);
    void roomManager.startRoom(code).then((room) => {
      console.log(`[Socket] Room status after startRoom: ${room?.getStatus()}`);
    });
    io.to(code).emit('game_started');
    console.log(`[Socket] Emitted game_started to room: ${code}`);
  });

  socket.on('call_number', async ({ code, number }: CallNumberPayload) => {
    await roomManager.recordCalledNumber(code, number);
    socket.to(code).emit('number_called', number);
  });

  socket.on('mark_number', async ({ code, ticketId, cellId, isMarked, markedAtCallCount }: MarkNumberPayload) => {
    await roomManager.recordMarkedNumber(code, ticketId, cellId, isMarked, markedAtCallCount);
    socket.to(code).emit('mark_number_broadcast', { ticketId, cellId, isMarked, markedAtCallCount });
  });

  socket.on('sync_ticket', async ({ code, ticket }: SyncTicketPayload) => {
    await roomManager.recordTicket(code, ticket);
  });

  socket.on('claim', ({ code, playerId, claimType }: ClaimPayload) => {
    socket.to(code).emit('player_claim', { playerId, claimType });
  });

  socket.on('claim_result', ({ code, playerId, claimType, isValid }: ClaimResultPayload) => {
    io.to(code).emit('claim_result_broadcast', { playerId, claimType, isValid });
  });

  socket.on('player_finished', ({ code, playerId, rank }: { code: string, playerId: string, rank: number }) => {
    const room = roomManager.getRoom(code);
    if (room) {
      const player = room.getPlayers().find(p => p.id === playerId);
      if (player) {
        player.isFinished = true;
        player.finishedRank = rank;
      }
    }
    socket.to(code).emit('player_finished_broadcast', { playerId, rank });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const data = socketDataMap.get(socket.id);
    if (data) {
      const { code, playerId } = data;
      if (playerId) {
        const room = roomManager.getRoom(code);
        if (room) {
          room.removePlayer(playerId);
          io.to(code).emit('player_left', playerId);
        }
      }
      socketDataMap.delete(socket.id);
    }
  });
});

async function startServer(): Promise<void> {
  await connectToDatabase();
  await roomManager.loadActiveRoomsFromDb();

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
