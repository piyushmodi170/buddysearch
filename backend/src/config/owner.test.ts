import assert from 'node:assert/strict';
import { isCanonicalOwnerEmail, isOwnerEmail, OWNER_EMAIL } from './owner.js';

assert.equal(OWNER_EMAIL, 'piyushmodi170@gmail.com');
assert.equal(isOwnerEmail('piyushmodi170@gmail.com'), true);
assert.equal(isOwnerEmail('  PIYUSHMODI170@GMAIL.COM  '), true);
assert.equal(isOwnerEmail('someone@gmail.com'), false);
assert.equal(isOwnerEmail('admin@buddysearch.in'), false);
assert.equal(isOwnerEmail(''), false);
assert.equal(isOwnerEmail(null), false);
assert.equal(isOwnerEmail(undefined), false);

assert.equal(isCanonicalOwnerEmail('piyushmodi170@gmail.com'), true);
assert.equal(isCanonicalOwnerEmail('  piyushmodi170@gmail.com  '), true);
assert.equal(isCanonicalOwnerEmail('Piyushmodi170@gmail.com'), false);
assert.equal(isCanonicalOwnerEmail('PIYUSHMODI170@GMAIL.COM'), false);
assert.equal(isCanonicalOwnerEmail('someone@gmail.com'), false);

console.log('owner allowlist tests passed');
