import assert from 'node:assert/strict';

// Mongo unique indexes treat missing vs null differently. Pending payments
// must omit razorpayPaymentId so a second checkout is not E11000.
const pending = {
  userId: '64b0c0c0c0c0c0c0c0c0c0c0',
  planId: '64b0c0c0c0c0c0c0c0c0c0c1',
  amount: 449,
  method: 'UPI',
  upiVpa: 'owner@okaxis',
  upiReference: 'BS1234567890',
  status: 'PENDING',
};

assert.equal('razorpayPaymentId' in pending, false);
assert.equal('razorpayOrderId' in pending, false);
assert.equal(pending.method, 'UPI');
console.log('pending payment shape tests passed');
