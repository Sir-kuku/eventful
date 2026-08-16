import { Request, Response, NextFunction } from 'express';
import * as paystackService from '../services/paystack.service';
import * as ticketService from '../services/ticket.service';
import ApiError from '../utils/ApiError';
import crypto from 'crypto';
import { Payment } from '../models/Payment.model';

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { event_id, amount } = req.body;
    const user = (req as any).user;

    const response = await paystackService.initializePayment(
      user.email,
      amount,
      { event_id, user_id: user._id, ticket_price: amount }
    );

    res.status(200).json({
      statusCode: 200,
      data: { authorization_url: response.authorization_url, reference: response.reference },
      message: 'Payment initialized. Redirect user to the URL.',
    });
  } catch (error) { next(error); }
};

export const paystackWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Unauthorized webhook request' });
    }

    const event = req.body;
    
    if (event.event === 'charge.success') {
      const metadata = event.data.metadata;
      const reference = event.data.reference;

      const existingPayment = await Payment.findOne({ reference });
      if (!existingPayment) {
        await Payment.create({
          user_id: metadata.user_id,
          event_id: metadata.event_id,
          reference: reference,
          amount: event.data.amount / 100,
          status: 'pending',
          paystack_response: event.data,
        });
      }

      const payment = await Payment.findOne({ reference });
      if (payment && payment.status !== 'success') {
        await ticketService.generateTicket(payment._id.toString());
      }
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ message: 'Webhook processed with errors logged.' });
  }
};
