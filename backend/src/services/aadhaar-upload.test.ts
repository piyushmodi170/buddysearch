import assert from 'node:assert/strict';
import { aadhaarProfilePatch } from './aadhaar-upload.js';

const patch = aadhaarProfilePatch('https://cdn.example/aadhaar/user-1.jpg');

assert.equal(patch.aadhaarUrl, 'https://cdn.example/aadhaar/user-1.jpg');
assert.equal('aadhaarVerified' in patch, false);
assert.deepEqual(Object.keys(patch), ['aadhaarUrl']);

console.log('aadhaar upload patch tests passed');
