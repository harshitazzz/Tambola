import { Request, Response } from 'express';
import { RoomManager } from '../services/RoomManager';

const roomManager = RoomManager.getInstance();

export class RoomController {
  public static createRoom(req: Request, res: Response): void {
    const { settings } = req.body;
    try {
      const newRoom = roomManager.createRoom(settings);
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

  public static joinRoom(req: Request, res: Response): void {
    const { code, playerName, playerId } = req.body;

    if (!code || !playerName || !playerId) {
      res.status(400).json({
        success: false,
        message: 'Room code, player name, and player ID are required'
      });
      return;
    }

    try {
      const room = roomManager.joinRoom(code, playerName, playerId);

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

  public static getRoom(req: Request, res: Response): void {
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

  public static startRoom(req: Request, res: Response): void {
    const { code } = req.body;
    try {
      const room = roomManager.getRoom(code as string);
      if (room) {
        room.startGame();
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
