import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

export const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We skip caching for non-GET requests like POST, PUT, DELETE
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    const cachedData = await redis.get(key);

    if (cachedData) {
      // If found in Redis, return it immediately
      return res.status(200).json(JSON.parse(cachedData));
    }

    // If not found, override the res.json method to capture the response and cache it
    const originalJson = res.json;
    res.json = function (data) {
      // Save to Redis with the provided duration (in seconds)
      redis.setex(key, duration, JSON.stringify(data));
      return originalJson.call(this, data);
    };

    next();
  };
};
