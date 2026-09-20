import assert from 'node:assert/strict';
import { isPaidPlan } from './membership.service.js';

assert.equal(isPaidPlan('BASIC', null), false);
assert.equal(isPaidPlan('BASIC', undefined), false);
assert.equal(isPaidPlan('BASIC', '2010-01-01'), false);
assert.equal(isPaidPlan('BASIC', new Date(Date.now() + 86400000)), true);
assert.equal(isPaidPlan('STAR', null), true);
assert.equal(isPaidPlan('FREE', new Date(Date.now() + 86400000)), false);

console.log('membership paid-plan tests passed');
