import assert from 'node:assert/strict';
import { ownerSessionUser } from './owner-account.js';
import { OWNER_EMAIL } from './owner.js';

const user = ownerSessionUser('64b0c0c0c0c0c0c0c0c0c0c0', { name: 'Piyush' });
assert.equal(user.email, OWNER_EMAIL);
assert.equal(user.isAdmin, true);
assert.equal(user.role, 'BOTH');
assert.equal(user.onboardingCompleted, true);
assert.equal(user.banned, false);

console.log('owner session helper tests passed');
