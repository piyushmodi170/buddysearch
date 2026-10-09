import assert from 'node:assert/strict';
import { UPI_UTR_LIVE_UNIQUE_INDEX, UTR_LIVE_STATUSES, utrClashWhere } from './payment-utr.js';

const clash = utrClashWhere('123456789012', '64b0c0c0c0c0c0c0c0c0c0aa');
assert.equal(clash.upiUtr, '123456789012');
assert.deepEqual(clash.id, { not: '64b0c0c0c0c0c0c0c0c0c0aa' });
assert.deepEqual(clash.status, { in: ['PENDING', 'SUCCESS'] });
assert.equal(UTR_LIVE_STATUSES.includes('FAILED' as (typeof UTR_LIVE_STATUSES)[number]), false);

assert.equal(UPI_UTR_LIVE_UNIQUE_INDEX.unique, true);
assert.equal(UPI_UTR_LIVE_UNIQUE_INDEX.name, 'upiUtr_live_unique');
assert.deepEqual(UPI_UTR_LIVE_UNIQUE_INDEX.partialFilterExpression.status, {
  $in: ['PENDING', 'SUCCESS'],
});

console.log('payment UTR reuse tests passed');
