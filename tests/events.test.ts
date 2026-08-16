import request from 'supertest';
import { app } from '../src/server';
import { User } from '../src/models/User.model';
import { Event } from '../src/models/Event.model';
import { connectDB, disconnectDB } from '../src/config/db';
import { redis } from '../src/config/redis';

let creatorToken: string;
let creatorId: string;
let eventId: string;

beforeAll(async () => {
  await connectDB();

  // 1. Create a test Creator and log them in
  const regRes = await request(app).post('/api/v1/auth/register').send({
    email: 'event.test.creator@example.com',
    password: 'TestPassword123',
    name: 'Event Test Creator',
    role: 'creator'
  });
  creatorId = regRes.body.data.user._id;
  
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'event.test.creator@example.com',
    password: 'TestPassword123'
  });
  creatorToken = loginRes.body.data.accessToken;
}, 30000); // ?? Increased timeout to 30 seconds

afterAll(async () => {
  await User.deleteMany({ email: 'event.test.creator@example.com' });
  await Event.deleteMany({ created_by: creatorId });
  await disconnectDB();
  await redis.quit();
}, 30000); // ?? Increased timeout to 30 seconds

describe('Event CRUD Operations', () => {
  it('should create a new event (Creator only)', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        title: 'Jest Test Event',
        description: 'Created by tests.',
        category: 'Testing',
        location: 'Virtual',
        date: '2026-12-01',
        time: '14:00',
        ticket_price: 5000,
        total_tickets: 100,
        reminder_options: ['1 day before']
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.title).toEqual('Jest Test Event');
    eventId = res.body.data._id; // Save for next tests
  });

  it('should return 401 if non-creator tries to create an event', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({ title: 'Hacked Event' });
    expect(res.statusCode).toEqual(401);
  });

  it('should retrieve a list of public events', async () => {
    const res = await request(app).get('/api/v1/events');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should update an existing event (Creator only)', async () => {
    const res = await request(app)
      .put(`/api/v1/events/${eventId}`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ title: 'Updated Jest Test Event' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.title).toEqual('Updated Jest Test Event');
  });

  it('should delete an existing event (Creator only)', async () => {
    const res = await request(app)
      .delete(`/api/v1/events/${eventId}`)
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Event deleted successfully');
  });
});
