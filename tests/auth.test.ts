import request from 'supertest';
import { app } from '../src/server';
import { User } from '../src/models/User.model';
import { connectDB, disconnectDB } from '../src/config/db';
import { redis } from '../src/config/redis'; // Import Redis

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await User.deleteMany({});
  await disconnectDB();
  await redis.quit(); // Properly close Redis connection
});

describe('Auth Endpoints', () => {
  it('should register a new eventee successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'testeventee@example.com',
        password: 'TestPassword123',
        name: 'Test Eventee',
        role: 'eventee',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.statusCode).toEqual(201);
    expect(res.body.data.user.email).toEqual('testeventee@example.com');
    expect(res.body.data.user.role).toEqual('eventee');
  });

  it('should prevent duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'testeventee@example.com',
        password: 'TestPassword123',
        name: 'Test Eventee Duplicate',
        role: 'eventee',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Email already registered');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testeventee@example.com',
        password: 'TestPassword123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
