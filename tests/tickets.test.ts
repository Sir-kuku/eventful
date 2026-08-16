import request from 'supertest';
import { app } from '../src/server';
import { User } from '../src/models/User.model';
import { Event } from '../src/models/Event.model';
import { Ticket } from '../src/models/Ticket.model';
import { Payment } from '../src/models/Payment.model';
import { connectDB, disconnectDB } from '../src/config/db';
import { redis } from '../src/config/redis';
import { generateTicket } from '../src/services/ticket.service';

// Mock the email service to avoid real API calls
jest.mock('../src/services/email.service', () => ({
  sendPurchaseConfirmationEmail: jest.fn().mockResolvedValue({}),
  sendReminderEmail: jest.fn().mockResolvedValue({}),
}));

let creatorToken: string;
let creatorId: string;
let eventId: string;
let eventeeId: string;

beforeAll(async () => {
  await connectDB();

  const regCreator = await request(app).post('/api/v1/auth/register').send({
    email: 'ticket.creator@example.com',
    password: 'TestPassword123',
    name: 'Ticket Creator',
    role: 'creator'
  });
  creatorId = regCreator.body.data.user._id;
  const loginCreator = await request(app).post('/api/v1/auth/login').send({
    email: 'ticket.creator@example.com',
    password: 'TestPassword123'
  });
  creatorToken = loginCreator.body.data.accessToken;

  const eventRes = await request(app)
    .post('/api/v1/events')
    .set('Authorization', `Bearer ${creatorToken}`)
    .send({
      title: 'Ticket Test Event',
      description: 'Testing ticket generation.',
      category: 'Tech',
      location: 'Online',
      date: '2026-12-12',
      time: '10:00',
      ticket_price: 5000,
      total_tickets: 10,
    });
  eventId = eventRes.body.data._id;

  const regEventee = await request(app).post('/api/v1/auth/register').send({
    email: 'ticket.eventee@example.com',
    password: 'TestPassword123',
    name: 'Ticket Eventee',
    role: 'eventee'
  });
  eventeeId = regEventee.body.data.user._id;
}, 30000);

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['ticket.creator@example.com', 'ticket.eventee@example.com'] } });
  await Event.deleteMany({ created_by: creatorId });
  await Ticket.deleteMany({ eventee_id: eventeeId });
  await disconnectDB();
  await redis.quit();
}, 30000);

describe('Ticket Generation Logic', () => {
  it('should successfully generate a ticket and QR code (mocking the webhook)', async () => {
    const uniqueReference = 'mock_ref_' + Date.now();
    const mockPayment = await Payment.create({
      user_id: eventeeId,
      event_id: eventId,
      reference: uniqueReference,
      amount: 5000,
      status: 'pending'
    });

    const result = await generateTicket(mockPayment._id.toString());

    expect(result.ticket).toBeDefined();
    expect(result.ticket.event_id.toString()).toEqual(eventId);
    expect(result.ticket.eventee_id.toString()).toEqual(eventeeId);
    expect(result.ticket.qr_code).toContain('data:image/png;base64');
    expect(result.event.tickets_sold).toEqual(1);
  }, 60000);

  it('should reject generation if ticket is already scanned or invalid', async () => {
    await expect(generateTicket('invalid_payment_id')).rejects.toThrow();
  });
});
