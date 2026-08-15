import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken, 
  logout,
  getMe,
  updateMe
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../config/validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

export default router;