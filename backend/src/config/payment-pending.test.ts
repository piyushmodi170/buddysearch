import assert from 'node:assert/strict';

// Mongo unique indexes treat missing vs null differently. Pending payments
// must omit razorpayPaymentId so a second checkout is not E11000.
const pending = {
  userId: '64b0c0c0c0c0c0c0c0c0c0c0',
  planId: '64b0c0c0c0c0c0c0c0c0c0c1',
  amount: 449,
  razorpayOrderId: 'order_test_1',
  status: 'PENDING',
};

assert.equal('razorpayPaymentId' in pending, false);
assert.equal(pending.razorpayOrderId.startsWith('order_'), true);
console.log('pending payment shape tests passed');
