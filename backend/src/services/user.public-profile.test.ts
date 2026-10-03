import assert from 'node:assert/strict';
import { stripPrivateProfileFields } from './public-profile.js';

const leaked = stripPrivateProfileFields({
  id: '507f1f77bcf86cd799439011',
  name: 'Victim',
  bio: 'Cafe buddy in Pune',
  city: 'Pune',
  state: 'Maharashtra',
  avatar: 'https://cdn.example/a.jpg',
  verified: true,
  membershipPlan: 'STAR',
  email: 'victim@example.com',
  phone: '9876543210',
  aadhaarUrl: 'https://cdn.example/aadhaar/victim-1.jpg',
  googleId: 'google-sub-1',
  passwordHash: '$2a$10$not-a-real-hash',
  isAdmin: true,
  banned: false,
  emailVerified: true,
  avgRating: 4.5,
  reviewCount: 3,
});

assert.equal(leaked.name, 'Victim');
assert.equal(leaked.city, 'Pune');
assert.equal(leaked.verified, true);
assert.equal(leaked.membershipPlan, 'STAR');
assert.equal(leaked.avgRating, 4.5);
assert.equal(leaked.email, undefined);
assert.equal(leaked.phone, undefined);
assert.equal(leaked.aadhaarUrl, undefined);
assert.equal(leaked.googleId, undefined);
assert.equal(leaked.passwordHash, undefined);
assert.equal(leaked.isAdmin, undefined);
assert.equal(leaked.banned, undefined);
assert.equal(leaked.emailVerified, undefined);
assert.equal(stripPrivateProfileFields(null), null);

console.log('public profile strip tests passed');
