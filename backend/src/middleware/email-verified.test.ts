import assert from 'node:assert/strict';
import { OWNER_EMAIL } from '../config/owner.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { accessDeniedUntilEmailVerified } from './email-verified.js';

assert.equal(accessDeniedUntilEmailVerified(null), false);
assert.equal(accessDeniedUntilEmailVerified(undefined), false);
assert.equal(
  accessDeniedUntilEmailVerified({ email: 'member@example.com', emailVerified: true }),
  false,
);
assert.equal(
  accessDeniedUntilEmailVerified({ email: 'member@example.com' }),
  false,
  'pre-existing tokens without the claim must keep working',
);
assert.equal(
  accessDeniedUntilEmailVerified({ email: 'member@example.com', emailVerified: false }),
  true,
);
assert.equal(
  accessDeniedUntilEmailVerified({ email: OWNER_EMAIL, emailVerified: false }),
  false,
);
assert.equal(
  accessDeniedUntilEmailVerified({ email: 'member@example.com', emailVerified: false, isAdmin: true }),
  false,
);

{
  const token = generateToken({
    id: '64b0c0c0c0c0c0c0c0c0c0c0',
    email: 'member@example.com',
    role: 'CLIENT',
    isAdmin: false,
    emailVerified: false,
  });
  const decoded = verifyToken(token);
  assert.equal(decoded?.emailVerified, false);
  assert.equal(accessDeniedUntilEmailVerified(decoded), true);
}

console.log('email-verified gate tests passed');
