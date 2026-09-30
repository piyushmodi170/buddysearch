import assert from 'node:assert/strict';
import { verifyEmailClientUser } from './verify-email-user.js';

const leaked = verifyEmailClientUser({
  name: 'Victim',
  email: 'victim@example.com',
  onboardingCompleted: true,
  phone: '9876543210',
  aadhaarUrl: 'https://bucket/aadhaar/victim.pdf',
  passwordHash: '$2a$10$secret',
  googleId: 'google-sub-secret',
  lat: 19.07,
  lng: 72.87,
  isAdmin: true,
} as any);

assert.deepEqual(leaked, {
  name: 'Victim',
  email: 'victim@example.com',
  emailVerified: true,
  onboardingCompleted: true,
});
assert.equal('phone' in leaked, false);
assert.equal('aadhaarUrl' in leaked, false);
assert.equal('passwordHash' in leaked, false);
assert.equal('googleId' in leaked, false);
assert.equal('lat' in leaked, false);
assert.equal('isAdmin' in leaked, false);

console.log('auth-email verify response tests passed');
