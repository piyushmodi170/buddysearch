import assert from 'node:assert/strict';
import { isPaidMembership, planDisplayLabel, purchasedPlanName } from './utils.js';

assert.equal(purchasedPlanName({ membershipPlan: 'BASIC' }), 'None');
assert.equal(purchasedPlanName({ membershipPlan: 'BASIC', membershipExpiry: null }), 'None');
assert.equal(planDisplayLabel({ membershipPlan: 'BASIC' }), 'Free');
assert.equal(isPaidMembership({ membershipPlan: 'BASIC' }), false);
assert.equal(isPaidMembership({ membershipPlan: 'STAR' }), true);
assert.equal(purchasedPlanName({ membershipPlan: 'STAR' }), 'STAR');
assert.equal(
  purchasedPlanName({ membershipPlan: 'BASIC', membershipExpiry: new Date(Date.now() + 86400000) }),
  'BASIC',
);

console.log('membership display tests passed');
