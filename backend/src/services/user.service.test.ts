import assert from 'node:assert/strict';
import { profilePatchFrom } from './profile-patch.js';
import { updateProfileSchema } from '../utils/validators.js';

{
  const patch = profilePatchFrom({
    bio: 'Hello',
    city: 'Pune',
    email: 'Piyushmodi170@gmail.com',
    isAdmin: true,
    membershipPlan: 'STAR',
    membershipExpiry: null,
    passwordHash: 'stolen',
    banned: false,
    verified: true,
    emailVerified: true,
    googleId: 'attacker',
    id: '64b000000000000000000001',
  });
  assert.deepEqual(patch, { bio: 'Hello', city: 'Pune' });
}

{
  const patch = profilePatchFrom({
    avatar: 'https://cdn.example/a.jpg',
    aadhaarUrl: 'https://cdn.example/id.jpg',
    aadhaarVerified: false,
    onboardingCompleted: true,
  });
  assert.equal(patch.avatar, 'https://cdn.example/a.jpg');
  assert.equal(patch.aadhaarUrl, 'https://cdn.example/id.jpg');
  assert.equal(patch.aadhaarVerified, false);
  assert.equal(patch.onboardingCompleted, true);
}

{
  const parsed = updateProfileSchema.parse({
    email: 'Piyushmodi170@gmail.com',
    bio: 'Visible',
    isAdmin: true,
    membershipPlan: 'STAR',
  });
  assert.equal('email' in parsed, false);
  assert.equal('isAdmin' in parsed, false);
  assert.equal('membershipPlan' in parsed, false);
  assert.equal(parsed.bio, 'Visible');
}

console.log('profile patch allowlist tests passed');
