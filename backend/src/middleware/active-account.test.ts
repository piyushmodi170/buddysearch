import assert from 'node:assert/strict';
import { evaluateAccount } from './active-account.js';

{
  const result = evaluateAccount(null);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 401);
    assert.match(result.message, /invalid or expired/i);
  }
}

{
  const result = evaluateAccount(undefined);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 401);
}

{
  const result = evaluateAccount({ banned: true });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 403);
    assert.match(result.message, /suspended/i);
  }
}

{
  const result = evaluateAccount({ banned: false });
  assert.equal(result.ok, true);
}

console.log('active-account tests passed');
