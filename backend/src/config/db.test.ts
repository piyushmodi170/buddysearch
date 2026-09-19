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
assert.equal(
  publicAuthError({ message: 'Invalid `prisma.user.update()` invocation' }, 'fallback'),
  'fallback'
);
assert.equal(
  publicAuthError({ message: 'Record to update not found.' }, 'fallback'),
  'fallback'
);
assert.equal(
  publicAuthError(
    { message: 'Error converting field "email" of expected non-nullable type "String", found incompatible value of "null".' },
    'Could not load dashboard'
  ),
  'Could not load dashboard'
);
assert.equal(publicAuthError(new Error('Wrong password'), 'fallback'), 'Wrong password');

console.log('database error classification tests passed');
