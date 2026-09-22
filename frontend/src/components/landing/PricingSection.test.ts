import assert from 'node:assert/strict';
import { FALLBACK_PLANS } from './PricingSection.js';

assert.equal(FALLBACK_PLANS.length, 4);
assert.deepEqual(FALLBACK_PLANS.map((p) => p.name), ['Basic', 'Standard', 'Premium', 'Star']);
assert.equal(FALLBACK_PLANS[0].price, '₹249');
assert.equal(FALLBACK_PLANS[1].price, '₹349');
assert.equal(FALLBACK_PLANS[2].price, '₹449');
assert.equal(FALLBACK_PLANS[3].price, '₹649');
assert.equal(FALLBACK_PLANS[2].highlighted, true);
console.log('landing paid plans tests passed');
