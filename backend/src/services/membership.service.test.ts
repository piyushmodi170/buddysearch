import assert from 'node:assert/strict';
import { isPaidPlan, isUnpaidFreeLaunchStar, PLATFORM_ACCESS_FREE } from './membership.service.js';

assert.equal(PLATFORM_ACCESS_FREE, false);
assert.equal(isPaidPlan('BASIC', null), false);
assert.equal(isPaidPlan('BASIC', undefined), false);
assert.equal(isPaidPlan('BASIC', '2010-01-01'), false);
assert.equal(isPaidPlan('STAR', null), true);
assert.equal(isPaidPlan('FREE', null), false);
assert.equal(isPaidPlan('PREMIUM', new Date(Date.now() + 86_400_000)), true);
assert.equal(isPaidPlan('STANDARD', new Date(Date.now() - 86_400_000)), false);

assert.equal(isUnpaidFreeLaunchStar({ membershipPlan: 'STAR' }, false), true);
assert.equal(isUnpaidFreeLaunchStar({ membershipPlan: 'STAR' }, true), false);
assert.equal(isUnpaidFreeLaunchStar({ membershipPlan: 'STAR', isAdmin: true }, false), false);
assert.equal(isUnpaidFreeLaunchStar({ membershipPlan: 'BASIC' }, false), false);
assert.equal(isUnpaidFreeLaunchStar(null, false), false);

console.log('membership paid-plan tests passed');
