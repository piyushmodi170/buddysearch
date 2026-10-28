import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { isUnpaidMembershipRow } from './unpaid-membership.js';

assert.equal(isUnpaidMembershipRow({ membershipPlan: 'BASIC', membershipExpiry: null }), true);
assert.equal(isUnpaidMembershipRow({ membershipPlan: 'BASIC', membershipExpiry: undefined }), true);
assert.equal(isUnpaidMembershipRow({ membershipPlan: 'BASIC', membershipExpiry: new Date('2099-01-01') }), false);
assert.equal(isUnpaidMembershipRow({ membershipPlan: 'STAR', membershipExpiry: null }), false);
assert.equal(isUnpaidMembershipRow({ membershipPlan: 'PREMIUM', membershipExpiry: new Date('2099-01-01') }), false);
assert.equal(isUnpaidMembershipRow({ membershipPlan: 'STANDARD', membershipExpiry: null }), false);
assert.equal(isUnpaidMembershipRow(null), false);
assert.equal(isUnpaidMembershipRow(undefined), false);

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'payment.service.ts'), 'utf8');
const fnStart = src.indexOf('const settleSuccessfulPayment');
const fnEnd = src.indexOf('const userAfterSettledPayment');
assert.ok(fnStart >= 0 && fnEnd > fnStart, 'settleSuccessfulPayment is present');
const fn = src.slice(fnStart, fnEnd);
const activateAt = fn.indexOf('activatePlan(');
const successAt = fn.indexOf("status: 'SUCCESS'");
assert.ok(activateAt >= 0 && successAt >= 0, 'activation and SUCCESS write are both present');
assert.ok(activateAt < successAt, 'membership must be granted before the payment is marked SUCCESS');

console.log('payment activation tests passed');
