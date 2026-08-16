import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  event_id: mongoose.Schema.Types.ObjectId;
  eventee_id: mongoose.Schema.Types.ObjectId;
  qr_code: string; // Base64 string or URL to the QR code image
  is_scanned: boolean;
  scanned_at?: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventee_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    qr_code: { type: String, required: true },
    is_scanned: { type: Boolean, default: false },
    scanned_at: { type: Date },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
