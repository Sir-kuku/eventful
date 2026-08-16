import { Router } from 'express';
import { getOverview } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// ?? Creator-only analytics endpoint
router.get('/overview', authenticate, authorize('creator'), getOverview);

export default router;
