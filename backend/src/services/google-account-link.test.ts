import assert from 'node:assert/strict';
import { OWNER_EMAIL } from '../config/owner.js';
import {
  canAttachGoogleToExistingUser,
  parkedUnverifiedEmail,
} from './google-account-link.js';
import { sanitizeProfilePatch } from './profile-patch.js';
import { updateProfileSchema } from '../utils/validators.js';

{
  const parked = parkedUnverifiedEmail('64b0c0c0c0c0c0c0c0c0c0c0');
  assert.equal(parked, 'unverified-64b0c0c0c0c0c0c0c0c0c0c0@invalid.local');
}

{
  // Attacker reserved victim@gmail.com and never verified.
  assert.equal(
    canAttachGoogleToExistingUser({
      email: 'victim@gmail.com',
      emailVerified: false,
      googleId: null,
    }),
    false,
  );
}

{
  // Same person: verified email/password account may add Google.
  assert.equal(
    canAttachGoogleToExistingUser({
      email: 'victim@gmail.com',
      emailVerified: true,
      googleId: null,
    }),
    true,
  );
}

{
  assert.equal(
    canAttachGoogleToExistingUser({
      email: 'victim@gmail.com',
      emailVerified: false,
      googleId: 'google-sub-1',
    }),
    true,
  );
}

{
  assert.equal(
    canAttachGoogleToExistingUser({
      email: OWNER_EMAIL,
      emailVerified: false,
      googleId: null,
    }),
    true,
  );
}

{
  const parsed = updateProfileSchema.parse({
    name: 'Asha',
    email: 'victim@gmail.com',
    bio: 'Travel buddy',
  });
  assert.equal('email' in parsed, false);
  assert.equal(parsed.name, 'Asha');
  assert.equal(parsed.bio, 'Travel buddy');
}

{
  const patch = sanitizeProfilePatch({
    bio: 'Travel buddy',
    email: 'victim@gmail.com',
    passwordHash: 'stolen',
    isAdmin: true,
    membershipPlan: 'STAR',
    emailVerified: true,
    googleId: 'attacker',
  });
  assert.equal(patch.bio, 'Travel buddy');
  assert.equal('email' in patch, false);
  assert.equal('passwordHash' in patch, false);
  assert.equal('isAdmin' in patch, false);
  assert.equal('membershipPlan' in patch, false);
  assert.equal('emailVerified' in patch, false);
  assert.equal('googleId' in patch, false);
}

console.log('google account link tests passed');
