import assert from 'node:assert/strict';
import { profileWriteData } from './user-profile-write.js';
import { updateProfileSchema } from '../utils/validators.js';

const cleaned = profileWriteData({
  city: 'Mumbai',
  bio: 'Hello',
  email: 'victim@gmail.com',
  passwordHash: 'stolen',
  isAdmin: true,
  emailVerified: true,
  banned: false,
  verified: true,
  membershipPlan: 'STAR',
  membershipExpiry: null,
  googleId: 'sub-123',
  aadhaarVerified: false,
});

assert.equal(cleaned.city, 'Mumbai');
assert.equal(cleaned.bio, 'Hello');
assert.equal('email' in cleaned, false);
assert.equal('passwordHash' in cleaned, false);
assert.equal('isAdmin' in cleaned, false);
assert.equal('emailVerified' in cleaned, false);
assert.equal('membershipPlan' in cleaned, false);
assert.equal('googleId' in cleaned, false);

const parsed = updateProfileSchema.parse({
  city: 'Pune',
  email: 'taken@example.com',
});
assert.equal(parsed.city, 'Pune');
assert.equal('email' in parsed, false);

console.log('profile write sanitization tests passed');
