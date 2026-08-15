import { Router } from 'express';
import { 
  createTask, 
  getAllTasks, 
  getTaskById, 
  updateTask, 
  deleteTask 
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes here are protected
router.post('/', authenticate, createTask);
router.get('/', authenticate, getAllTasks);
router.get('/:id', authenticate, getTaskById);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;