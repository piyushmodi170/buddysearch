import crypto from 'crypto';

/** Checkout HMAC must be checked whenever /verify can activate a plan. An empty keyId used to skip the check. */
export const razorpayCheckoutSignatureValid = (
  keyId: string | undefined,
  keySecret: string | undefined,
  orderId: string,
  paymentId: string,
  signature: string,
) => {
  if (!keyId || !keySecret || !orderId || !paymentId || !signature) return false;
  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(`${orderId}|${paymentId}`);
  const expected = hmac.digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(String(signature), 'hex');
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};
