import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  location: string;
  date: Date;
  time: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  reminder_options: string[];
  is_active: boolean;
  created_by: mongoose.Schema.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    ticket_price: { type: Number, required: true },
    total_tickets: { type: Number, required: true, min: 1 },
    tickets_sold: { type: Number, default: 0 },
    reminder_options: [{ type: String }],
    is_active: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
