import { Router } from 'express';
import { setReminder } from '../controllers/reminder.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// ?? Eventee-only route to set a reminder
router.post('/', authenticate, authorize('eventee'), setReminder);

export default router;
