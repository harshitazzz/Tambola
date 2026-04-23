import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import roomRoutes from './routes/roomRoutes';

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

interface ClaimPayload {
  code: string;
  playerId: string;
  claimType: string;
}

interface ClaimResultPayload extends ClaimPayload {
  isValid: boolean;
}

io.on('connection', (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', (code: string) => {
    socket.join(code);
    console.log(`Socket ${socket.id} joined room: ${code}`);
    // Notify others in the room
    socket.to(code).emit('player_joined');
  });

  socket.on('start_game', (code: string) => {
    io.to(code).emit('game_started');
  });

  socket.on('call_number', ({ code, number }: CallNumberPayload) => {
    socket.to(code).emit('number_called', number);
  });

  socket.on('mark_number', ({ code, ticketId, cellId, isMarked, markedAtCallCount }: MarkNumberPayload) => {
    socket.to(code).emit('mark_number_broadcast', { ticketId, cellId, isMarked, markedAtCallCount });
  });

  socket.on('claim', ({ code, playerId, claimType }: ClaimPayload) => {
    socket.to(code).emit('player_claim', { playerId, claimType });
  });

  socket.on('claim_result', ({ code, playerId, claimType, isValid }: ClaimResultPayload) => {
     io.to(code).emit('claim_result_broadcast', { playerId, claimType, isValid });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
