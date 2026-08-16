import request from 'supertest';
import { app } from '../src/server';
import { User } from '../src/models/User.model';
import { Event } from '../src/models/Event.model';
import { Ticket } from '../src/models/Ticket.model';
import { connectDB, disconnectDB } from '../src/config/db';
import { redis } from '../src/config/redis';

let eventId: string;
let creatorToken: string;
let ticketId: string;
let eventeeId: string;

beforeAll(async () => {
  await connectDB();

  // 1. Create Creator & Event
  const creator = await request(app).post('/api/v1/auth/register').send({
    email: 'qr.creator@example.com',
    password: 'TestPassword123',
    name: 'QR Creator',
    role: 'creator'
  });
  const login = await request(app).post('/api/v1/auth/login').send({
    email: 'qr.creator@example.com',
    password: 'TestPassword123'
  });
  creatorToken = login.body.data.accessToken;

  const eventRes = await request(app)
    .post('/api/v1/events')
    .set('Authorization', `Bearer ${creatorToken}`)
    .send({ title: 'QR Test Event', description: 'QR test', category: 'Test', location: 'Online', date: '2026-12-20', time: '15:00', ticket_price: 1000, total_tickets: 5 });
  eventId = eventRes.body.data._id;

  // 2. Create Eventee & Ticket manually for testing
  const eventee = await request(app).post('/api/v1/auth/register').send({
    email: 'qr.eventee@example.com',
    password: 'TestPassword123',
    name: 'QR Eventee',
    role: 'eventee'
  });
  eventeeId = eventee.body.data.user._id;

  const ticket = await Ticket.create({
    event_id: eventId,
    eventee_id: eventeeId,
    qr_code: 'data:image/png;base64,testqr',
    is_scanned: false
  });
  ticketId = ticket._id.toString();
}, 30000);

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['qr.creator@example.com', 'qr.eventee@example.com'] } });
  await Event.deleteMany({ _id: eventId });
  await Ticket.deleteMany({ _id: ticketId });
  await disconnectDB();
  await redis.quit();
}, 30000);

describe('QR Code Verification Endpoint', () => {
  it('should verify a valid, unscanned ticket', async () => {
    const res = await request(app)
      .post('/api/v1/qr/verify')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        ticketId: ticketId,
        eventId: eventId,
        eventeeId: eventeeId
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('QR Code verified successfully. Attendee admitted!');
  });

  it('should reject a ticket that has already been scanned', async () => {
    const res = await request(app)
      .post('/api/v1/qr/verify')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        ticketId: ticketId,
        eventId: eventId,
        eventeeId: eventeeId
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Ticket has already been scanned and used.');
  });

  it('should reject an invalid ticket ID', async () => {
    const res = await request(app)
      .post('/api/v1/qr/verify')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        ticketId: '111111111111111111111111', // ? Changed to a valid 24-hex string (to avoid Mongoose CastError)
        eventId: eventId,
        eventeeId: eventeeId
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Invalid QR Code: Ticket not found');
  });
});
