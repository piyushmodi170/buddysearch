import assert from 'node:assert/strict';
import { isPaidPlan } from './membership.service.js';

assert.equal(isPaidPlan('BASIC', null), true);
assert.equal(isPaidPlan('BASIC', undefined), true);
assert.equal(isPaidPlan('BASIC', '2010-01-01'), true);
assert.equal(isPaidPlan('STAR', null), true);
assert.equal(isPaidPlan('FREE', null), true);

console.log('membership paid-plan tests passed');
