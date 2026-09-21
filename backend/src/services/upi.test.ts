import assert from 'node:assert/strict';
import { buildUpiIntent, isValidUtr, isValidVpa, makeUpiReference, normalizeUtr, normalizeVpa } from './upi.js';

assert.equal(isValidVpa('piyush@okaxis'), true);
assert.equal(isValidVpa(normalizeVpa('  Piyush@OKAxis  ')), true);
assert.equal(isValidVpa('not-an-id'), false);
assert.equal(isValidVpa('a@b'), false);

assert.equal(isValidUtr(normalizeUtr('123456789012')), true);
assert.equal(isValidUtr(normalizeUtr('abc 12345 xyz')), true);
assert.equal(isValidUtr('short'), false);

const intent = buildUpiIntent({
  vpa: 'owner@okaxis',
  payeeName: 'Buddy Search',
  amount: 649,
  note: 'BS123',
});
assert.equal(intent, 'upi://pay?pa=owner@okaxis&pn=Buddy%20Search&am=649&cu=INR&tn=BS123');

assert.match(makeUpiReference(1_700_000_000_123), /^BS/);

console.log('upi helper tests passed');
