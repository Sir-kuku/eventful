import { Router } from 'express';
import { verifyTicket } from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Only Creators can verify tickets at their events
router.post('/verify', authenticate, authorize('creator'), verifyTicket);

export default router;
