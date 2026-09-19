import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, verifyPaymentSchema } from '../utils/validators.js';
import * as paymentService from '../services/payment.service.js';
import crypto from 'crypto';
import { getSetting } from '../config/settings.js';

const router = Router();

router.post('/create-order', auth, validate(createOrderSchema), async (req, res, next) => {
  try {
    const data = await paymentService.createOrder(req.user!.id, req.body.planId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/verify', auth, validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const data = await paymentService.verifyPayment(req.body, req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const razorpay = await getSetting('razorpay');
    const secret = razorpay.webhookSecret;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!secret || !signature) {
      return res.status(400).json({ success: false, message: 'Webhook signing is not configured' });
    }

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update((req as any).rawBody || Buffer.from(JSON.stringify(req.body)));
    const digest = shasum.digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Process webhook
    // e.g., payment.captured -> activate plan
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
