import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  event_id: mongoose.Schema.Types.ObjectId;
  ticket_id: mongoose.Schema.Types.ObjectId;
  reference: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paystack_response?: any; // Store the raw Paystack webhook response
}

const PaymentSchema = new Schema<IPayment>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paystack_response: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
