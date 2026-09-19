import { prisma } from '../config/db.js';
import { config } from '../config/index.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { activatePlan } from './membership.service.js';

const instance = new Razorpay({
  key_id: config.razorpay.keyId || 'mock',
  key_secret: config.razorpay.keySecret || 'mock'
});

export const createOrder = async (userId: string, planId: string) => {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan not found');

  if (config.nodeEnv === 'development' && !config.razorpay.keyId) {
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
    return { id: mockOrderId, amount: plan.price * 100, currency: 'INR' };
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

  return order;
};

export const verifyPayment = async (data: any, userId: string) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;
  
  const hmac = crypto.createHmac('sha256', config.razorpay.keySecret);
  hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
  const expectedSignature = hmac.digest('hex');

  if (expectedSignature !== razorpaySignature && config.razorpay.keyId) {
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

  // Activate the membership plan for the user
  await activatePlan(userId, payment.planId);

  return { success: true };
};
