import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FILES } from './logo-download.js';

for (const spec of Object.values(FILES)) {
  assert.equal(existsSync(join(process.cwd(), 'public', spec.disk)), true, spec.disk);
  assert.ok(spec.download.endsWith('.png'));
}

console.log('logo-download tests passed');
