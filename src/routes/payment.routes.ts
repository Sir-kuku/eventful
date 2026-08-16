import { Router } from 'express';
import { initiatePayment, paystackWebhook } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import express from 'express';

const router = Router();

// ?? Protected route - Eventee initiates payment (must be logged in as eventee)
router.post('/initiate', authenticate, authorize('eventee'), initiatePayment);

// ?? Public webhook route - Paystack calls this. 
// We use express.raw() to preserve the raw body for signature verification.
router.post('/webhook', express.raw({type: 'application/json'}), paystackWebhook);

export default router;
