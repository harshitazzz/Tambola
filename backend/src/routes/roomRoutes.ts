import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';

const router = Router();

router.post('/create', RoomController.createRoom);
router.post('/join', RoomController.joinRoom);
router.post('/start', RoomController.startRoom);
router.get('/get/:code', RoomController.getRoom);

export default router;
