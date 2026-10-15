import assert from 'node:assert/strict';
import crypto from 'crypto';
import { razorpayCheckoutSignatureValid } from './payment-verify.js';

const sign = (secret: string, orderId: string, paymentId: string) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest('hex');
};

const orderId = 'order_abc';
const paymentId = 'pay_xyz';
const keyId = 'rzp_live_abc';
const keySecret = 'super-secret';
const good = sign(keySecret, orderId, paymentId);

assert.equal(
  razorpayCheckoutSignatureValid(keyId, keySecret, orderId, paymentId, good),
  true,
);

assert.equal(
  razorpayCheckoutSignatureValid(keyId, keySecret, orderId, paymentId, '00'.repeat(32)),
  false,
  'wrong signature must fail',
);

assert.equal(
  razorpayCheckoutSignatureValid('', keySecret, orderId, paymentId, good),
  false,
  'empty keyId used to skip HMAC and activate unpaid Razorpay rows',
);

assert.equal(
  razorpayCheckoutSignatureValid(keyId, '', orderId, paymentId, sign('', orderId, paymentId)),
  false,
  'empty keySecret must not accept an HMAC of the empty string',
);

assert.equal(
  razorpayCheckoutSignatureValid(undefined, undefined, orderId, paymentId, 'deadbeef'),
  false,
);

console.log('payment verify signature tests passed');
