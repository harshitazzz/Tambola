import { Request, Response } from 'express';
import { RoomManager } from '../services/RoomManager';

const roomManager = RoomManager.getInstance();

export class RoomController {
  public static async createRoom(req: Request, res: Response): Promise<void> {
    const { settings } = req.body;
    try {
      const newRoom = await roomManager.createRoom(settings);
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: newRoom.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create room'
      });
    }
  }

  public static async joinRoom(req: Request, res: Response): Promise<void> {
    const { code, playerName, playerId } = req.body;

    if (!code || !playerName || !playerId) {
      res.status(400).json({
        success: false,
        message: 'Room code, player name, and player ID are required'
      });
      return;
    }

    try {
      const room = await roomManager.joinRoom(code, playerName, playerId);

      if (room) {
        res.status(200).json({
          success: true,
          message: 'Joined room successfully',
          data: room.toJSON()
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Room not found or invalid code'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while joining the room'
      });
    }
  }

  public static async getRoom(req: Request, res: Response): Promise<void> {
    const { code } = req.params;
    try {
      const room = roomManager.getRoom(code as string);
      if (room) {
        res.status(200).json({
          success: true,
          data: room.toJSON()
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch room details'
      });
    }
  }

  public static async startRoom(req: Request, res: Response): Promise<void> {
    const { code } = req.body;
    try {
      const room = await roomManager.startRoom(code as string);
      if (room) {
        res.status(200).json({
          success: true,
          message: 'Game started',
          data: room.toJSON()
        });
      } else {
        res.status(404).json({ success: false, message: 'Room not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to start game' });
    }
  }
}
