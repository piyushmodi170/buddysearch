import assert from 'node:assert/strict';
import { renderVars } from './email-templates.js';

assert.equal(renderVars('Hi {{name}}', { name: 'Piyush' }), 'Hi Piyush');
assert.equal(renderVars('Code {{ otp }}', { otp: '123456' }), 'Code 123456');
assert.equal(renderVars('Code {{code}}', { otp: '123456' }), 'Code 123456');
assert.equal(renderVars('Code {{otp}}', { code: '999111' }), 'Code 999111');
assert.equal(renderVars('Missing {{other}}', { name: 'x' }), 'Missing ');
console.log('email template tests passed');
