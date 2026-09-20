import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  parseSignatureHeader,
  signSeoAgentBody,
  verifySeoAgentRequest,
  SEO_AGENT_MAX_SKEW_SECONDS,
} from './seo-agent.js';

const accessToken = 'test-access-token-32chars-minimum';
const signingSecret = 'test-signing-secret-32chars-min';

function sampleBody(eventId = randomUUID()) {
  return Buffer.from(
    JSON.stringify({
      event_type: 'publish_articles',
      event_id: eventId,
      version: '1',
      action: 'create',
      timestamp: new Date().toISOString(),
      data: {
        articles: [
          {
            id: 'art_1',
            title: 'Hire a cafe buddy in Pune',
            slug: 'hire-a-cafe-buddy-in-pune',
            content_markdown: '# Hello\n\nA short post about hiring a cafe buddy.',
            content_html: '<h1>Hello</h1><p>A short post about hiring a cafe buddy.</p>',
            meta_description: 'How to hire a cafe buddy in Pune on Buddy Search.',
            image_url: 'https://example.com/cover.jpg',
            tags: ['cafe', 'pune'],
            created_at: '2026-09-20T00:00:00.000Z',
          },
        ],
      },
    }),
  );
}

function signedHeaders(raw: Buffer, eventId: string, overrides?: { t?: number; v1?: string; token?: string }) {
  const t = overrides?.t ?? Math.floor(Date.now() / 1000);
  const v1 = overrides?.v1 ?? signSeoAgentBody(signingSecret, t, raw);
  return {
    authorization: `Bearer ${overrides?.token ?? accessToken}`,
    signature: `t=${t},v1=${v1}`,
    eventIdHeader: eventId,
  };
}

const eventId = randomUUID();
const raw = sampleBody(eventId);

const happy = verifySeoAgentRequest({
  rawBody: raw,
  accessToken,
  signingSecret,
  ...signedHeaders(raw, eventId),
});
assert.equal(happy.ok, true);
if (happy.ok) assert.equal(happy.payload.data.articles[0].slug, 'hire-a-cafe-buddy-in-pune');

const badBearer = verifySeoAgentRequest({
  rawBody: raw,
  accessToken,
  signingSecret,
  ...signedHeaders(raw, eventId, { token: 'wrong-token' }),
});
assert.equal(badBearer.ok, false);
if (!badBearer.ok) assert.equal(badBearer.status, 401);

const tampered = verifySeoAgentRequest({
  rawBody: raw,
  accessToken,
  signingSecret,
  ...signedHeaders(raw, eventId, { v1: 'aa'.repeat(32) }),
});
assert.equal(tampered.ok, false);
if (!tampered.ok) assert.equal(tampered.status, 401);

const stale = verifySeoAgentRequest({
  rawBody: raw,
  accessToken,
  signingSecret,
  ...signedHeaders(raw, eventId, { t: Math.floor(Date.now() / 1000) - SEO_AGENT_MAX_SKEW_SECONDS - 20 }),
});
assert.equal(stale.ok, false);
if (!stale.ok) {
  assert.equal(stale.status, 401);
  assert.match(stale.message, /stale/i);
}

const mismatch = verifySeoAgentRequest({
  rawBody: raw,
  accessToken,
  signingSecret,
  ...signedHeaders(raw, randomUUID()),
});
assert.equal(mismatch.ok, false);
if (!mismatch.ok) assert.equal(mismatch.status, 400);

const parsed = parseSignatureHeader('t=1710000000,v1=deadbeef');
assert.deepEqual(parsed, { t: 1710000000, v1: 'deadbeef' });

const replaySameId = verifySeoAgentRequest({
  rawBody: raw,
  accessToken,
  signingSecret,
  ...signedHeaders(raw, eventId),
});
assert.equal(replaySameId.ok, true);
if (replaySameId.ok) assert.equal(replaySameId.payload.event_id, eventId);

console.log('seo-agent webhook verify tests passed');
