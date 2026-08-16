import mongoose from 'mongoose';
import { Reminder } from '../models/Reminder.model';
import { Event } from '../models/Event.model';
import { Ticket } from '../models/Ticket.model';
import { sendReminderEmail } from './email.service';

export const setReminder = async (userId: string, eventId: string, reminderTime: Date) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');
  const ticket = await Ticket.findOne({ event_id: eventId, eventee_id: userId });
  if (!ticket) throw new Error('You must purchase a ticket before setting a reminder.');

  const existingReminder = await Reminder.findOne({ user_id: userId, event_id: eventId });
  if (existingReminder) {
    existingReminder.reminder_time = reminderTime;
    existingReminder.is_sent = false;
    await existingReminder.save();
    return existingReminder;
  }
  return await Reminder.create({ user_id: userId, event_id: eventId, reminder_time: reminderTime, is_sent: false });
};

export const processReminders = async () => {
  const now = new Date();
  const pendingReminders = await Reminder.find({ is_sent: false, reminder_time: { $lte: now } }).populate('user_id event_id');
  for (const reminder of pendingReminders) {
    try {
      const user = reminder.user_id as any;
      const event = reminder.event_id as any;
      if (!user || !event) continue;
      await sendReminderEmail(user.email, event.title, event.date, event.location);
      reminder.is_sent = true;
      reminder.sent_at = new Date();
      await reminder.save();
      console.log(`[Cron Job] Reminder sent to ${user.email} for event: ${event.title}`);
    } catch (error) { console.error(`[Cron Job] Failed to send reminder:`, error); }
  }
};
