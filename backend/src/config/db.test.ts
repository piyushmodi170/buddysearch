import assert from 'node:assert/strict';
import { isDatabaseError, publicAuthError, publicDatabaseError } from './db-errors.js';

assert.equal(isDatabaseError({ code: 'P1001', message: 'Cant reach database server' }), true);
assert.equal(isDatabaseError({ message: 'Server selection timeout' }), true);
assert.equal(isDatabaseError({ message: 'ReplicaSetNoPrimary' }), true);

assert.equal(
  isDatabaseError({ message: 'Invalid `prisma.user.findUnique()` invocation' }),
  false
);
assert.equal(isDatabaseError(new Error('Invalid credentials')), false);

assert.equal(
  publicAuthError({ message: 'Server selection timeout' }, 'fallback'),
  publicDatabaseError
);
assert.match(
  publicAuthError({ message: 'Invalid `prisma.user.update()` invocation' }, 'fallback'),
  /try Sign In again/i
);
assert.match(
  publicAuthError({ message: 'Record to update not found.' }, 'fallback'),
  /try Sign In again/i
);
assert.equal(publicAuthError(new Error('Wrong password'), 'fallback'), 'Wrong password');

console.log('database error classification tests passed');
