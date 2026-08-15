import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL as string;

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

export const redis = new Redis(REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});
