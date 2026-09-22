import assert from 'node:assert/strict';
import { hasPlatformAccess, isPaidMembership, planDisplayLabel, purchasedPlanName, PLATFORM_ACCESS_FREE } from './utils.js';

assert.equal(purchasedPlanName({ membershipPlan: 'BASIC' }), 'None');
assert.equal(purchasedPlanName({ membershipPlan: 'BASIC', membershipExpiry: null }), 'None');
assert.equal(planDisplayLabel({ membershipPlan: 'BASIC' }), 'Free');
assert.equal(isPaidMembership({ membershipPlan: 'BASIC' }), false);
assert.equal(isPaidMembership({ membershipPlan: 'STAR' }), true);
assert.equal(hasPlatformAccess({ membershipPlan: 'BASIC' }), false);
assert.equal(hasPlatformAccess({ membershipPlan: 'STAR' }), true);
assert.equal(
  hasPlatformAccess({ membershipPlan: 'BASIC', membershipExpiry: new Date(Date.now() + 86400000) }),
  true,
);
assert.equal(PLATFORM_ACCESS_FREE, false);
assert.equal(purchasedPlanName({ membershipPlan: 'STAR' }), 'STAR');
assert.equal(
  purchasedPlanName({ membershipPlan: 'BASIC', membershipExpiry: new Date(Date.now() + 86400000) }),
  'BASIC',
);

console.log('membership display tests passed');
