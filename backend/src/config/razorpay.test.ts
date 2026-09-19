import assert from 'node:assert/strict';
import { resolveRazorpaySettings } from './razorpay.js';

const fromLive = resolveRazorpaySettings({
  keyId: 'rzp_live_abc',
  keySecret: 'live-secret',
});
assert.equal(fromLive.mode, 'live');
assert.equal(fromLive.liveKeyId, 'rzp_live_abc');
assert.equal(fromLive.keyId, 'rzp_live_abc');
assert.equal(fromLive.keySecret, 'live-secret');

const ignoresTest = resolveRazorpaySettings({
  mode: 'test',
  testKeyId: 'rzp_test_abc',
  testKeySecret: 'test-secret',
  liveKeyId: 'rzp_live_abc',
  liveKeySecret: 'live-secret',
});
assert.equal(ignoresTest.mode, 'live');
assert.equal(ignoresTest.keyId, 'rzp_live_abc');
assert.equal(ignoresTest.keySecret, 'live-secret');

const fromTestOnly = resolveRazorpaySettings({ keyId: 'rzp_test_abc', keySecret: 'x' });
assert.equal(fromTestOnly.mode, 'test');
assert.equal(fromTestOnly.keyId, 'rzp_test_abc');
assert.equal(fromTestOnly.keySecret, 'x');
assert.equal(resolveRazorpaySettings({}).webhookSecret, '');

console.log('razorpay settings tests passed');
