import { paystack } from '../config/paystack';

interface Metadata {
  event_id: string;
  user_id: string;
  ticket_price: number;
}

export const initializePayment = async (email: string, amount: number, metadata: Metadata) => {
  try {
    // Paystack expects amounts in kobo (lowest currency unit). 100 kobo = 1 Naira.
    const amountInKobo = amount * 100;
    
    const response = await paystack.transaction.initialize({
      email,
      amount: amountInKobo,
      currency: 'NGN', // Nigerian Naira
      metadata: metadata, // We attach event_id and user_id so we know what to do when payment is successful
      callback_url: `${process.env.FRONTEND_URL}/payment-success`, // Redirect user here after payment
    });

    return response.data;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw new Error('Failed to initialize payment');
  }
};
