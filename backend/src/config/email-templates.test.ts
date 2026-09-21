import assert from 'node:assert/strict';
import { DEFAULT_EMAIL_TEMPLATES, renderVars, wrapEmailHtml } from './email-templates.js';

assert.equal(renderVars('Hi {{name}}', { name: 'Piyush' }), 'Hi Piyush');
assert.equal(renderVars('Code {{ otp }}', { otp: '123456' }), 'Code 123456');
assert.equal(renderVars('Code {{code}}', { otp: '123456' }), 'Code 123456');
assert.equal(renderVars('Code {{otp}}', { code: '999111' }), 'Code 999111');
assert.equal(renderVars('Missing {{other}}', { name: 'x' }), 'Missing ');
assert.ok(DEFAULT_EMAIL_TEMPLATES.some((t) => t.slug === 'unpaid-membership'));
assert.ok(DEFAULT_EMAIL_TEMPLATES.some((t) => t.slug === 'free-access-congrats'));
const congrats = DEFAULT_EMAIL_TEMPLATES.find((t) => t.slug === 'free-access-congrats')!;
assert.ok(congrats.subject.toLowerCase().includes('congrat'));
assert.ok(congrats.body.includes('free'));
const wrap = wrapEmailHtml('<p>Hi</p>', 'BuddySearch', 'https://buddysearch.online');
assert.ok(wrap.includes('https://buddysearch.online/logo.png'));
assert.ok(wrap.includes('Find a buddy for every plan'));
console.log('email template tests passed');
