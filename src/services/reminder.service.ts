import { Reminder } from '../models/Reminder.model';
import { Event } from '../models/Event.model';
import { Ticket } from '../models/Ticket.model';
import { User } from '../models/User.model';
import { sendReminderEmail } from './email.service';

// ?? NEW: Set a reminder for an eventee
export const setReminder = async (userId: string, eventId: string, reminderTime: Date) => {
  // 1. Check if the event actually exists
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

  // 2. Check if the user has actually bought a ticket for this event
  const ticket = await Ticket.findOne({ event_id: eventId, eventee_id: userId });
  if (!ticket) throw new Error('You must purchase a ticket for this event before setting a reminder.');

  // 3. Check if a reminder already exists for this user/event pair
  const existingReminder = await Reminder.findOne({ user_id: userId, event_id: eventId });
  if (existingReminder) {
    // Update the existing reminder time
    existingReminder.reminder_time = reminderTime;
    existingReminder.is_sent = false; // Reset sent status if time is changed
    await existingReminder.save();
    return existingReminder;
  }

  // 4. Create a new reminder
  const reminder = await Reminder.create({
    user_id: userId,
    event_id: eventId,
    reminder_time: reminderTime,
    is_sent: false,
  });
  return reminder;
};

// EXISTING: Process reminders for the Cron Job
export const processReminders = async () => {
  const now = new Date();
  
  // Find unsent reminders scheduled for now or in the past
  const pendingReminders = await Reminder.find({
    is_sent: false,
    reminder_time: { $lte: now }
  }).populate('user_id event_id');

  console.log(`[Cron Job] Found ${pendingReminders.length} reminder(s) to send.`);

  for (const reminder of pendingReminders) {
    try {
      const user = reminder.user_id as any;
      const event = reminder.event_id as any;

      if (!user || !event) continue;

      // Send the email
      await sendReminderEmail(
        user.email,
        event.title,
        event.date,
        event.location
      );

      // Mark as sent
      reminder.is_sent = true;
      reminder.sent_at = new Date();
      await reminder.save();

      console.log(`[Cron Job] Reminder sent to ${user.email} for event: ${event.title}`);
    } catch (error) {
      console.error(`[Cron Job] Failed to send reminder for ${reminder._id}:`, error);
    }
  }
};
