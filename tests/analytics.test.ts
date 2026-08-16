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

describe('Analytics Endpoints', () => {
  it('should return 401 without authentication', async () => {
    const res = await request(app).get('/api/v1/analytics/overview');
    expect(res.statusCode).toEqual(401);
  });
});
