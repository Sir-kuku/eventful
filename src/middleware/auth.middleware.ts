import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../config/redis';
import ApiError from '../utils/ApiError';
import { User } from '../models/User.model';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }

    const token = authHeader.split(' ')[1];
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new ApiError(401, 'Token has been revoked (logged out)'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      return next(new ApiError(401, 'User belonging to this token no longer exists'));
    }

    (req as any).user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
