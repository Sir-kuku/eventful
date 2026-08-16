import { Request, Response, NextFunction } from 'express';
import { Ticket } from '../models/Ticket.model';
import { Event } from '../models/Event.model';
import ApiError from '../utils/ApiError';

export const verifyTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId, eventId, eventeeId } = req.body;
    const user = (req as any).user;

    // 1. Find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new ApiError(404, 'Invalid QR Code: Ticket not found'));

    // 2. Find the event
    const event = await Event.findById(eventId);
    if (!event) return next(new ApiError(404, 'Event not found'));

    // 3. Verify that the user scanning is the Creator of this Event
    if (event.created_by.toString() !== user._id.toString()) {
      return next(new ApiError(403, 'You are not authorized to verify tickets for this event.'));
    }

    // 4. Check if the ticket has already been scanned
    if (ticket.is_scanned) {
      return next(new ApiError(400, 'Ticket has already been scanned and used.'));
    }

    // 5. Mark the ticket as scanned
    ticket.is_scanned = true;
    ticket.scanned_at = new Date();
    await ticket.save();

    res.status(200).json({
      statusCode: 200,
      data: {
        event: event.title,
        scanned_at: ticket.scanned_at,
        attendee_name: ticket.eventee_id, // You could populate this to get the name
        status: 'Valid Ticket - Entry Authorized'
      },
      message: 'QR Code verified successfully. Attendee admitted!'
    });
  } catch (error) { next(error); }
};
