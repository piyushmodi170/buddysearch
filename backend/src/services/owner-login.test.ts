import assert from 'node:assert/strict';
import { OWNER_EMAIL } from '../config/owner.js';
import { ownerEnvPasswordMatches } from './owner-login.js';

const prevAdmin = process.env.ADMIN_PASSWORD;
const prevOwner = process.env.OWNER_PASSWORD;

const restore = () => {
  if (prevAdmin === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = prevAdmin;
  if (prevOwner === undefined) delete process.env.OWNER_PASSWORD;
  else process.env.OWNER_PASSWORD = prevOwner;
};

try {
  delete process.env.ADMIN_PASSWORD;
  delete process.env.OWNER_PASSWORD;

  // Public owner email must never be accepted as the password.
  assert.equal(ownerEnvPasswordMatches(OWNER_EMAIL, OWNER_EMAIL), false);
  assert.equal(ownerEnvPasswordMatches(OWNER_EMAIL, 'anything'), false);

  process.env.ADMIN_PASSWORD = 'env-only-secret';
  assert.equal(ownerEnvPasswordMatches(OWNER_EMAIL, 'env-only-secret'), true);
  assert.equal(ownerEnvPasswordMatches(OWNER_EMAIL, OWNER_EMAIL), false);
  assert.equal(ownerEnvPasswordMatches('attacker@example.com', 'env-only-secret'), false);

  delete process.env.ADMIN_PASSWORD;
  process.env.OWNER_PASSWORD = 'owner-env-secret';
  assert.equal(ownerEnvPasswordMatches(OWNER_EMAIL, 'owner-env-secret'), true);
  assert.equal(ownerEnvPasswordMatches(OWNER_EMAIL, OWNER_EMAIL), false);
} finally {
  restore();
}

console.log('owner login password tests passed');
