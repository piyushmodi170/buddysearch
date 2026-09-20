import assert from 'node:assert/strict';
import { toPublicBuddy } from './public-buddy.js';

const leaked = toPublicBuddy({
  id: 'u1',
  name: 'Asha',
  city: 'Pune',
  bio: 'Travel buddy',
  verified: true,
  membershipPlan: 'BASIC',
  email: 'asha@example.com',
  phone: '9876543210',
  passwordHash: '$2a$10$secret',
  googleId: 'google-sub',
  aadhaarUrl: 'https://files.example/aadhaar.jpg',
  isAdmin: true,
  banned: false,
  emailVerified: true,
  avgRating: 4.5,
});

assert.equal(leaked.name, 'Asha');
assert.equal(leaked.city, 'Pune');
assert.equal(leaked.verified, true);
assert.equal(leaked.avgRating, 4.5);
assert.equal('email' in leaked, false);
assert.equal('phone' in leaked, false);
assert.equal('passwordHash' in leaked, false);
assert.equal('googleId' in leaked, false);
assert.equal('aadhaarUrl' in leaked, false);
assert.equal('isAdmin' in leaked, false);
assert.equal('banned' in leaked, false);
assert.equal('emailVerified' in leaked, false);

console.log('matching public buddy tests passed');
