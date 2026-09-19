import { prisma } from '../config/db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { activatePlan } from './membership.service.js';
import { publicUser } from './auth.service.js';
import { getSetting } from '../config/settings.js';
import { config } from '../config/index.js';

const razorpayClient = async () => {
  const razorpay = await getSetting('razorpay');
  return {
    settings: razorpay,
    instance: new Razorpay({
      key_id: razorpay.keyId || 'mock',
      key_secret: razorpay.keySecret || 'mock',
    }),
  };
};

export const createOrder = async (userId: string, planId: string) => {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan not found');

  const { settings, instance } = await razorpayClient();

  if ((config.nodeEnv === 'development' && !settings.keyId) || !settings.keyId) {
    if (config.nodeEnv !== 'development') {
      throw new Error('Razorpay is not configured');
    }
    const mockOrderId = `order_mock_${Date.now()}`;
    await prisma.payment.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        razorpayOrderId: mockOrderId,
        status: 'PENDING'
      }
    });
    return { id: mockOrderId, amount: plan.price * 100, currency: 'INR', keyId: settings.keyId || '' };
  }

  const options = {
    amount: plan.price * 100,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`
  };

  const order = await instance.orders.create(options);

  await prisma.payment.create({
    data: {
      userId,
      planId,
      amount: plan.price,
      razorpayOrderId: order.id,
      status: 'PENDING'
    }
  });

  return { ...order, keyId: settings.keyId };
};

export const verifyPayment = async (data: any, userId: string) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;
  const razorpay = await getSetting('razorpay');

  const hmac = crypto.createHmac('sha256', razorpay.keySecret);
  hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
  const expectedSignature = hmac.digest('hex');

  if (expectedSignature !== razorpaySignature && razorpay.keyId) {
    throw new Error('Invalid signature');
  }

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId } });
  if (!payment) throw new Error('Payment not found');
  if (payment.userId !== userId) throw new Error('Payment does not belong to this user');

  if (payment.status === 'SUCCESS') {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    return { success: true, user: existing ? publicUser(existing) : undefined };
  }

  await prisma.payment.update({
    where: { razorpayOrderId },
    data: { razorpayPaymentId, status: 'SUCCESS' }
  });

  const updated = await activatePlan(userId, payment.planId);

  return { success: true, user: publicUser(updated) };
};

export const testRazorpayCredentials = async () => {
  const razorpay = await getSetting('razorpay');
  const keyId = razorpay.liveKeyId || razorpay.keyId;
  const keySecret = razorpay.liveKeySecret || razorpay.keySecret;
  if (!keyId || !keySecret) {
    throw new Error('Add Live Key ID and Live Key secret, then save.');
  }
  if (!keyId.startsWith('rzp_live_')) {
    throw new Error('Use the Live Key ID from Razorpay (starts with rzp_live_), not the Test Key ID.');
  }

  const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await instance.orders.create({
    amount: 100,
    currency: 'INR',
    receipt: `cred_test_${Date.now()}`,
  });

  return {
    ok: true,
    mode: 'live' as const,
    keyId,
    orderId: order.id,
    webhookRequired: false,
    webhookConfigured: Boolean(razorpay.webhookSecret),
  };
};
