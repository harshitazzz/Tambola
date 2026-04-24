"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const RoomManager_1 = require("../services/RoomManager");
const roomManager = RoomManager_1.RoomManager.getInstance();
class RoomController {
    static async createRoom(req, res) {
        const { settings } = req.body;
        try {
            const newRoom = await roomManager.createRoom(settings);
            res.status(201).json({
                success: true,
                message: 'Room created successfully',
                data: newRoom.toJSON()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create room'
            });
        }
    }
    static async joinRoom(req, res) {
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
            }
            else {
                res.status(404).json({
                    success: false,
                    message: 'Room not found or invalid code'
                });
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'An error occurred while joining the room'
            });
        }
    }
    static async getRoom(req, res) {
        const { code } = req.params;
        try {
            const room = roomManager.getRoom(code);
            if (room) {
                res.status(200).json({
                    success: true,
                    data: room.toJSON()
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: 'Room not found'
                });
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch room details'
            });
        }
    }
    static async startRoom(req, res) {
        const { code } = req.body;
        try {
            const room = await roomManager.startRoom(code);
            if (room) {
                res.status(200).json({
                    success: true,
                    message: 'Game started',
                    data: room.toJSON()
                });
            }
            else {
                res.status(404).json({ success: false, message: 'Room not found' });
            }
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to start game' });
        }
    }
}
exports.RoomController = RoomController;
