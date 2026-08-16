import QRCode from 'qrcode';
import { Ticket } from '../models/Ticket.model';
import { Payment } from '../models/Payment.model';
import { Event } from '../models/Event.model';
import { sendPurchaseConfirmationEmail } from './email.service';

export const generateTicket = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).populate('event_id user_id');
  if (!payment || payment.status === 'success') throw new Error('Payment not found or already processed');

  const event = await Event.findById(payment.event_id);
  if (!event || !event.is_active) throw new Error('Event is no longer available.');
  if (event.tickets_sold >= event.total_tickets) throw new Error('Event is sold out.');

  const qrData = JSON.stringify({
    ticketId: payment._id.toString(),
    eventId: payment.event_id.toString(),
    eventeeId: payment.user_id.toString(),
  });
  const qrCodeBase64 = await QRCode.toDataURL(qrData);

  // ?? PERMANENT FIX: Use .toString() to convert populated objects to strings explicitly
  const newTicket = await Ticket.create({
    event_id: payment.event_id.toString(),
    eventee_id: payment.user_id.toString(),
    qr_code: qrCodeBase64,
    is_scanned: false,
  });

  const updatedQrData = JSON.stringify({
    ticketId: newTicket._id.toString(),
    eventId: payment.event_id.toString(),
    eventeeId: payment.user_id.toString(),
  });
  newTicket.qr_code = await QRCode.toDataURL(updatedQrData);
  await newTicket.save();

  payment.ticket_id = newTicket._id;
  payment.status = 'success';
  await payment.save();

  event.tickets_sold += 1;
  if (event.tickets_sold >= event.total_tickets) event.is_active = false;
  await event.save();

  const user = payment.user_id as any;
  if (user && user.email) {
    try {
      await sendPurchaseConfirmationEmail(user.email, event.title, newTicket.qr_code);
      console.log(`? Confirmation email sent to ${user.email} for event ${event.title}`);
    } catch (emailError) { console.error('?? Failed to send email, but ticket was generated:', emailError); }
  }
  return { ticket: newTicket, payment, event };
};
