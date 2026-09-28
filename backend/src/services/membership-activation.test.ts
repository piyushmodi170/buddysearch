import assert from 'node:assert/strict';
import { resolveMembershipActivation } from './membership-activation.js';

const now = new Date('2026-09-28T12:00:00.000Z');
const monthsFromNow = (months: number) => {
  const date = new Date(now);
  date.setMonth(date.getMonth() + months);
  return date;
};

const firstBasic = resolveMembershipActivation(
  { membershipPlan: 'BASIC', membershipExpiry: null },
  { name: 'BASIC', durationMonths: 3 },
  now,
);
assert.equal(firstBasic.membershipPlan, 'BASIC');
assert.equal(firstBasic.membershipExpiry?.toISOString(), monthsFromNow(3).toISOString());

const keepStar = resolveMembershipActivation(
  { membershipPlan: 'STAR', membershipExpiry: null },
  { name: 'BASIC', durationMonths: 3 },
  now,
);
assert.equal(keepStar.membershipPlan, 'STAR');
assert.equal(keepStar.membershipExpiry, null);

const keepStarFromPremium = resolveMembershipActivation(
  { membershipPlan: 'STAR', membershipExpiry: null },
  { name: 'PREMIUM', durationMonths: 12 },
  now,
);
assert.equal(keepStarFromPremium.membershipPlan, 'STAR');
assert.equal(keepStarFromPremium.membershipExpiry, null);

const upgradeToStar = resolveMembershipActivation(
  { membershipPlan: 'PREMIUM', membershipExpiry: new Date('2027-01-01T00:00:00.000Z') },
  { name: 'STAR', durationMonths: 0 },
  now,
);
assert.equal(upgradeToStar.membershipPlan, 'STAR');
assert.equal(upgradeToStar.membershipExpiry, null);

const keepPremiumName = resolveMembershipActivation(
  { membershipPlan: 'PREMIUM', membershipExpiry: new Date('2027-06-01T00:00:00.000Z') },
  { name: 'BASIC', durationMonths: 3 },
  now,
);
assert.equal(keepPremiumName.membershipPlan, 'PREMIUM');
assert.equal(keepPremiumName.membershipExpiry?.toISOString(), '2027-06-01T00:00:00.000Z');

const extendSamePlan = resolveMembershipActivation(
  { membershipPlan: 'STANDARD', membershipExpiry: new Date('2026-10-15T12:00:00.000Z') },
  { name: 'STANDARD', durationMonths: 6 },
  now,
);
assert.equal(extendSamePlan.membershipPlan, 'STANDARD');
assert.equal(extendSamePlan.membershipExpiry?.toISOString(), monthsFromNow(6).toISOString());

const expiredDoesNotBlock = resolveMembershipActivation(
  { membershipPlan: 'PREMIUM', membershipExpiry: new Date('2026-01-01T00:00:00.000Z') },
  { name: 'BASIC', durationMonths: 3 },
  now,
);
assert.equal(expiredDoesNotBlock.membershipPlan, 'BASIC');
assert.equal(expiredDoesNotBlock.membershipExpiry?.toISOString(), monthsFromNow(3).toISOString());

console.log('membership activation tests passed');
