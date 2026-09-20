import assert from 'node:assert/strict';
import {
  CANONICAL_ORIGIN,
  canonicalRedirectLocation,
  shouldSkipCanonicalRedirect,
} from './canonical-host.js';

assert.equal(
  canonicalRedirectLocation('buddysearch.in', '/'),
  `${CANONICAL_ORIGIN}/`,
);
assert.equal(
  canonicalRedirectLocation('www.buddysearch.in', '/login?next=/find'),
  `${CANONICAL_ORIGIN}/login?next=/find`,
);
assert.equal(
  canonicalRedirectLocation('www.buddysearch.online', '/answers/hire-a-buddy'),
  `${CANONICAL_ORIGIN}/answers/hire-a-buddy`,
);
assert.equal(canonicalRedirectLocation('buddysearch.online', '/'), null);
assert.equal(canonicalRedirectLocation('localhost:3000', '/'), null);
assert.equal(canonicalRedirectLocation('127.0.0.1:3000', '/about'), null);
assert.equal(shouldSkipCanonicalRedirect('/api/auth/google'), true);
assert.equal(shouldSkipCanonicalRedirect('/login'), false);

console.log('canonical-host tests passed');
