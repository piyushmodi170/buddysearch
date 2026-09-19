import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { verifyGoogleIdToken } from './google-id-token.js';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const kid = 'test-kid-1';
const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

const claims = {
  iss: 'https://accounts.google.com',
  aud: 'client.apps.googleusercontent.com',
  email: 'victim@example.com',
  email_verified: true,
  sub: 'google-sub-1',
  name: 'Victim',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
};

const signed = jwt.sign(claims, privateKey, { algorithm: 'RS256', keyid: kid, header: { kid, alg: 'RS256' } });

const unsignedForged = [
  Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
  Buffer.from(
    JSON.stringify({
      aud: 'client.apps.googleusercontent.com',
      email: 'piyushmodi170@gmail.com',
      email_verified: true,
      sub: 'attacker',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString('base64url'),
  'fakesig',
].join('.');

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

{
  // Tokeninfo 400 must reject — previously fell through to unsigned payload decode.
  await assert.rejects(
    () =>
      verifyGoogleIdToken(unsignedForged, async () => jsonResponse(400, { error: 'invalid_token' })),
    /could not be verified/,
  );
}

{
  // Tokeninfo timeout + attacker key must not authenticate.
  await assert.rejects(
    () =>
      verifyGoogleIdToken(unsignedForged, async (url) => {
        if (String(url).includes('tokeninfo')) throw new Error('network');
        return jsonResponse(200, { [kid]: pem });
      }),
    /could not be verified/,
  );
}

{
  // When tokeninfo is down, a real RS256 token matching Google certs is accepted.
  const result = await verifyGoogleIdToken(signed, async (url) => {
    if (String(url).includes('tokeninfo')) throw new Error('network');
    return jsonResponse(200, { [kid]: pem });
  });
  assert.equal(result.email, 'victim@example.com');
  assert.equal(result.sub, 'google-sub-1');
}

{
  // Tokeninfo 200 is trusted (Google already verified the signature).
  const result = await verifyGoogleIdToken(signed, async (url) => {
    if (String(url).includes('tokeninfo')) return jsonResponse(200, { ...claims, email: 'from-tokeninfo@example.com' });
    throw new Error('certs should not be required');
  });
  assert.equal(result.email, 'from-tokeninfo@example.com');
}

console.log('google-id-token tests passed');
