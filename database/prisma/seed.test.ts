import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'seed.ts'), 'utf8');

assert.equal(src.includes('admin123'), false, 'seed must not write the published default password');
assert.equal(src.includes('passwordHash'), false, 'seed must not set or reset the owner password');
assert.equal(src.includes('bcrypt'), false, 'seed must not hash a password');

console.log('seed password tests passed');
