import Paystack from '@paystack/paystack-sdk';

// Initialize the Paystack SDK with your secret key
export const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);
