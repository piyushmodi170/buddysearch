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

const fromTest = resolveRazorpaySettings({
  keyId: 'rzp_test_abc',
  keySecret: 'test-secret',
});
assert.equal(fromTest.mode, 'test');
assert.equal(fromTest.testKeyId, 'rzp_test_abc');
assert.equal(fromTest.keyId, 'rzp_test_abc');

const split = resolveRazorpaySettings({
  mode: 'test',
  testKeyId: 'rzp_test_1',
  testKeySecret: 't',
  liveKeyId: 'rzp_live_1',
  liveKeySecret: 'l',
});
assert.equal(split.keyId, 'rzp_test_1');
assert.equal(resolveRazorpaySettings({ ...split, mode: 'live' }).keyId, 'rzp_live_1');

assert.equal(resolveRazorpaySettings({}).webhookSecret, '');

console.log('razorpay settings tests passed');
