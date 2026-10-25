import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isOwnerEmail, isPublishedSeedPassword, OWNER_EMAIL, PUBLISHED_SEED_PASSWORD } from './owner.js';

assert.equal(OWNER_EMAIL, 'piyushmodi170@gmail.com');
assert.equal(isOwnerEmail('piyushmodi170@gmail.com'), true);
assert.equal(isOwnerEmail('  PIYUSHMODI170@GMAIL.COM  '), true);
assert.equal(isOwnerEmail('someone@gmail.com'), false);
assert.equal(isOwnerEmail('admin@buddysearch.in'), false);
assert.equal(isOwnerEmail(''), false);
assert.equal(isOwnerEmail(null), false);
assert.equal(isOwnerEmail(undefined), false);

assert.equal(PUBLISHED_SEED_PASSWORD, 'admin123');
assert.equal(isPublishedSeedPassword('piyushmodi170@gmail.com', 'admin123'), true);
assert.equal(isPublishedSeedPassword('  PIYUSHMODI170@GMAIL.COM  ', 'admin123'), true);
assert.equal(isPublishedSeedPassword('piyushmodi170@gmail.com', 'other-password'), false);
assert.equal(isPublishedSeedPassword('member@example.com', 'admin123'), false);
assert.equal(isPublishedSeedPassword('', 'admin123'), false);

const seedSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../database/prisma/seed.ts'),
  'utf8',
);
assert.equal(seedSrc.includes('admin123'), false);
assert.equal(seedSrc.includes('passwordHash'), false);

console.log('owner allowlist tests passed');
