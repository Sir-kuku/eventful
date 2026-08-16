import { Router } from 'express';
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// ?? Public routes - Anyone can view events
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// ?? Creator-only routes (Must be logged in AND be a creator)
router.post('/', authenticate, authorize('creator'), createEvent);
router.put('/:id', authenticate, authorize('creator'), updateEvent);
router.delete('/:id', authenticate, authorize('creator'), deleteEvent);

export default router;
