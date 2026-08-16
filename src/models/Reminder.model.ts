import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  event_id: mongoose.Schema.Types.ObjectId;
  reminder_time: Date;
  is_sent: boolean;
  sent_at?: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    reminder_time: { type: Date, required: true },
    is_sent: { type: Boolean, default: false },
    sent_at: { type: Date },
  },
  { timestamps: true }
);

export const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
