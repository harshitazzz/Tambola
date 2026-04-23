import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private roomCode: string | null = null;
  // Queue listeners registered before socket is created
  private pendingListeners: Array<{ event: string; callback: (...args: any[]) => void }> = [];

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): void {
    if (!this.socket) {
      // Connect to the backend
      this.socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        if (this.roomCode) {
          // Re-join the room on reconnect
          this.socket?.emit('join_room', this.roomCode);
        }
      });

      // Flush any listeners that were registered before socket was created
      for (const { event, callback } of this.pendingListeners) {
        this.socket.on(event, callback);
      }
      this.pendingListeners = [];
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinRoom(code: string): void {
    this.roomCode = code;
    if (this.socket?.connected) {
      this.socket.emit('join_room', code);
    } else {
      this.connect(); // Ensuring it connects if it hasn't
    }
  }

  public emit(event: string, ...args: any[]): void {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      // Queue the listener if socket isn't created yet
      this.pendingListeners.push({ event, callback });
    }
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
    // Also remove from pending queue
    if (!callback) {
      this.pendingListeners = this.pendingListeners.filter(l => l.event !== event);
    } else {
      this.pendingListeners = this.pendingListeners.filter(
        l => !(l.event === event && l.callback === callback)
      );
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance();
