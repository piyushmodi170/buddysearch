import { prisma } from '../config/db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { activatePlan, findPlan } from './membership.service.js';
import { publicUser } from './auth.service.js';
import { getSetting } from '../config/settings.js';
import { config } from '../config/index.js';
import { insertPendingPayment } from '../config/mongo.js';
import { sendTransactional } from './mail.service.js';
import { buildUpiIntent, isValidUtr, makeUpiReference, normalizeUtr, normalizeVpa } from './upi.js';

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

const razorpayErrorMessage = (err: unknown) => {
  const e = err as { error?: { description?: string; reason?: string }; message?: string };
  return e?.error?.description || e?.error?.reason || e?.message || 'Failed to create payment order';
};

const markSuccessAndActivate = async (
  payment: { id: string; userId: string; planId: string; amount: number },
  extra: { razorpayPaymentId?: string } = {},
) => {
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'SUCCESS', ...extra },
  });

  const updated = await activatePlan(payment.userId, payment.planId);
  const plan = await findPlan(payment.planId).catch(() => null);
  void sendTransactional('payment-confirmation', updated.email, {
    name: updated.name,
    email: updated.email,
    plan: plan?.displayName || updated.membershipPlan,
    amount: String(payment.amount),
  }).then(() => sendTransactional('purchase-thanks', updated.email, {
    name: updated.name,
    email: updated.email,
    plan: plan?.displayName || updated.membershipPlan,
    amount: String(payment.amount),
  })).catch(() => undefined);

  return { success: true, user: publicUser(updated) };
};

export const getPublicUpiConfig = async () => {
  const upi = await getSetting('upi');
  const vpa = normalizeVpa(upi.vpa);
  return {
    configured: Boolean(vpa),
    vpa,
    payeeName: upi.payeeName || 'Buddy Search',
  };
};

export const createUpiOrder = async (userId: string, planId: string) => {
  const plan = await findPlan(planId);
  const upi = await getSetting('upi');
  const vpa = normalizeVpa(upi.vpa);
  if (!vpa) {
    throw new Error('UPI is not set. Open Admin → UPI, save your UPI ID, then try again.');
  }

  const reference = makeUpiReference();
  const inserted = await insertPendingPayment({
    userId,
    planId: plan.id,
    amount: plan.price,
    method: 'UPI',
    upiVpa: vpa,
    upiReference: reference,
  });

  const intentUrl = buildUpiIntent({
    vpa,
    payeeName: upi.payeeName || 'Buddy Search',
    amount: plan.price,
    note: reference,
  });

  return {
    paymentId: inserted.id,
    method: 'UPI' as const,
    amount: plan.price,
    currency: 'INR',
    vpa,
    payeeName: upi.payeeName || 'Buddy Search',
    reference,
    intentUrl,
    plan: { id: plan.id, name: plan.name, displayName: plan.displayName, price: plan.price },
  };
};

export const submitUtr = async (userId: string, paymentId: string, rawUtr: string) => {
  const utr = normalizeUtr(rawUtr);
  if (!isValidUtr(utr)) {
    throw new Error('UTR must be 8–22 letters or digits from your bank / UPI app.');
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Payment not found');
  if (payment.userId !== userId) throw new Error('Payment does not belong to this user');
  if (payment.status === 'SUCCESS') {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    return { success: true, status: 'SUCCESS', user: existing ? publicUser(existing) : undefined };
  }
  if (payment.status !== 'PENDING') throw new Error('This payment can no longer accept a UTR');

  const clash = await prisma.payment.findFirst({
    where: { upiUtr: utr, id: { not: paymentId } },
  });
  if (clash) throw new Error('This UTR is already used on another payment.');

  await prisma.payment.update({
    where: { id: paymentId },
    data: { upiUtr: utr, method: 'UPI' },
  });

  return { success: true, status: 'PENDING', message: 'UTR saved. Membership activates after the owner confirms the transfer.' };
};

export const listMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      amount: true,
      status: true,
      method: true,
      upiReference: true,
      upiUtr: true,
      createdAt: true,
      plan: { select: { name: true, displayName: true } },
    },
  });
};

export const confirmUpiPayment = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'SUCCESS') {
    return { success: true, already: true };
  }
  if (payment.status !== 'PENDING') throw new Error('Only pending transfers can be confirmed');
  if (!payment.upiUtr) throw new Error('Member has not submitted a UTR yet');
  return markSuccessAndActivate(payment);
};

export const rejectUpiPayment = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'SUCCESS') throw new Error('Successful payments cannot be rejected');
  await prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } });
  return { success: true };
};

export const createOrder = async (userId: string, planId: string) => {
  const plan = await findPlan(planId);

  const { settings, instance } = await razorpayClient();

  if (!settings.keyId || !settings.keySecret) {
    if (config.nodeEnv === 'development') {
      const mockOrderId = `order_mock_${Date.now()}`;
      await insertPendingPayment({
        userId,
        planId: plan.id,
        amount: plan.price,
        razorpayOrderId: mockOrderId,
      });
      return { id: mockOrderId, amount: plan.price * 100, currency: 'INR', keyId: settings.keyId || '' };
    }
    throw new Error(
      'Razorpay cannot onboard this category. Open Membership and pay with UPI.'
    );
  }

  const options = {
    amount: plan.price * 100,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`
  };

  let order;
  try {
    order = await instance.orders.create(options);
  } catch (err) {
    throw new Error(razorpayErrorMessage(err));
  }

  try {
    await insertPendingPayment({
      userId,
      planId: plan.id,
      amount: plan.price,
      razorpayOrderId: order.id,
    });
  } catch (err: any) {
    const text = String(err?.message || '');
    if (/E11000|duplicate|unique constraint/i.test(text)) {
      throw new Error('Could not save the payment. Refresh the page and try Get Premium again.');
    }
    throw err;
  }

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

  return markSuccessAndActivate(payment, { razorpayPaymentId });
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
