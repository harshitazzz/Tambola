"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStateModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const playerSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });
const ruleSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    count: { type: Number, required: true },
    points: { type: Number, required: true },
    enabled: { type: Boolean, required: true },
    description: { type: String, required: true }
}, { _id: false });
const markedNumberSchema = new mongoose_1.Schema({
    ticketId: { type: String, required: true },
    cellId: { type: String, required: true },
    isMarked: { type: Boolean, required: true },
    markedAtCallCount: { type: Number, required: false },
    updatedAt: { type: Date, required: true }
}, { _id: false });
const ticketCellSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    value: { type: Number, required: false, default: null },
    isMarked: { type: Boolean, required: true, default: false },
    markedAtCallCount: { type: Number, required: false }
}, { _id: false });
const ticketSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    playerId: { type: String, required: true },
    cells: { type: [[ticketCellSchema]], required: true }
}, { _id: false });
const roomStateSchema = new mongoose_1.Schema({
    roomCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    players: { type: [playerSchema], default: [] },
    tickets: { type: [ticketSchema], default: [] },
    calledNumbers: { type: [Number], default: [] },
    currentNumber: { type: Number, default: null },
    markedNumbers: { type: [markedNumberSchema], default: [] },
    settings: {
        type: {
            callingMethod: { type: String, enum: ['auto', 'manual'], required: true },
            autoInterval: { type: Number, required: false, default: null },
            rules: { type: [ruleSchema], required: true }
        },
        required: true
    },
    status: { type: String, enum: ['waiting', 'started'], required: true, default: 'waiting' },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true }
}, { versionKey: false });
roomStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.RoomStateModel = mongoose_1.default.model('RoomState', roomStateSchema);
