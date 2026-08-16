import { Event } from '../models/Event.model';
import { Ticket } from '../models/Ticket.model';
import mongoose from 'mongoose';

export const getCreatorAnalytics = async (creatorId: string) => {
  // 1. Total Revenue and Tickets Sold across ALL events using Mongoose Aggregation
  const overallStats = await Event.aggregate([
    { $match: { created_by: new mongoose.Types.ObjectId(creatorId) } },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        totalTicketsSold: { $sum: '$tickets_sold' },
        totalRevenue: { $sum: { $multiply: ['$ticket_price', '$tickets_sold'] } },
      }
    }
  ]);

  // 2. Per-Event Analytics (Attendees, QR Scans, and Conversion Rates)
  const eventStats = await Event.aggregate([
    { $match: { created_by: new mongoose.Types.ObjectId(creatorId) } },
    {
      $lookup: {
        from: 'tickets',
        localField: '_id',
        foreignField: 'event_id',
        as: 'tickets'
      }
    },
    {
      $project: {
        title: 1,
        date: 1,
        totalTickets: 1,
        ticketsSold: '$tickets_sold',
        totalAttendees: { $size: '$tickets' },
        scannedAttendees: {
          $size: {
            $filter: {
              input: '$tickets',
              as: 'ticket',
              cond: { $eq: ['$$ticket.is_scanned', true] }
            }
          }
        },
        revenue: { $multiply: ['$ticket_price', '$tickets_sold'] }
      }
    },
    {
      $addFields: {
        // Safe division to prevent divide by zero errors
        conversionRate: {
          $cond: [
            { $gt: ['$ticketsSold', 0] },
            { $multiply: [{ $divide: ['$scannedAttendees', '$ticketsSold'] }, 100] },
            0
          ]
        }
      }
    }
  ]);

  return {
    overall: overallStats[0] || { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0 },
    perEvent: eventStats
  };
};
