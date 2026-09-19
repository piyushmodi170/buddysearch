import { prisma } from '../config/db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { activatePlan } from './membership.service.js';
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
    return { success: true };
  }

  await prisma.payment.update({
    where: { razorpayOrderId },
    data: { razorpayPaymentId, status: 'SUCCESS' }
  });

  await activatePlan(userId, payment.planId);

  return { success: true };
};
