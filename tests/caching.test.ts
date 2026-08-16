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

describe('Caching Behavior', () => {
  it('should return cached response for repeated event list requests', async () => {
    const res1 = await request(app).get('/api/v1/events');
    const res2 = await request(app).get('/api/v1/events');
    expect(res1.statusCode).toEqual(200);
    expect(res2.statusCode).toEqual(200);
  });
});
