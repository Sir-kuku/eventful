import request from 'supertest';
import { app } from '../src/server';
import { connectDB, disconnectDB } from '../src/config/db';
import { redis } from '../src/config/redis';

beforeAll(async () => {
  await connectDB();
});
afterAll(async () => {
  await disconnectDB();
  await redis.quit();
});

describe('Rate Limiting', () => {
  it('should enforce general rate limit on public routes', async () => {
    const requests = Array(110).fill().map(() => request(app).get('/'));
    const results = await Promise.all(requests);
    const has429 = results.some(res => res.statusCode === 429);
    expect(has429).toBe(true);
  });
});
