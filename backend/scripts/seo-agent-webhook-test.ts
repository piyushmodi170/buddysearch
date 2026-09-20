#!/usr/bin/env npx tsx
/**
 * Signs sample SEO Agent payloads and POSTs them to the local receiver.
 * Covers: happy path, duplicate event_id, bad bearer, tampered signature,
 * stale timestamp, header/body event_id mismatch.
 *
 * Env:
 *   SEO_AGENT_ACCESS_TOKEN
 *   SEO_AGENT_SIGNING_SECRET
 *   SEO_AGENT_WEBHOOK_URL (default http://127.0.0.1:4000/api/webhooks/seo-agent)
 */
import { randomUUID } from 'node:crypto';
import { signSeoAgentBody, SEO_AGENT_MAX_SKEW_SECONDS } from '../src/webhooks/seo-agent.js';

const token = process.env.SEO_AGENT_ACCESS_TOKEN || '';
const secret = process.env.SEO_AGENT_SIGNING_SECRET || '';
const url = process.env.SEO_AGENT_WEBHOOK_URL || 'http://127.0.0.1:4000/api/webhooks/seo-agent';

if (!token || !secret) {
  console.error('Set SEO_AGENT_ACCESS_TOKEN and SEO_AGENT_SIGNING_SECRET to POST against a running server.');
  console.error('Unit tests (no server) already cover the six crypto cases:');
  console.error('  npx tsx src/webhooks/seo-agent.test.ts');
  process.exit(2);
}

function body(eventId: string) {
  return JSON.stringify({
    event_type: 'publish_articles',
    event_id: eventId,
    version: '1',
    action: 'create',
    timestamp: new Date().toISOString(),
    data: {
      articles: [
        {
          id: 'seo-agent-test-article',
          title: 'SEO Agent test article',
          slug: 'seo-agent-test-article',
          content_markdown: '## Heading\n\n- one\n- two\n\nA [link](https://buddysearch.online).',
          content_html: '<h2>Heading</h2><ul><li>one</li><li>two</li></ul><p>A <a href="https://buddysearch.online">link</a>.</p>',
          meta_description: 'Test article from The SEO Agent webhook script.',
          image_url: '',
          tags: ['test'],
          created_at: new Date().toISOString(),
        },
      ],
    },
  });
}

async function post(label: string, raw: string, headers: Record<string, string>) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: raw });
  const text = await res.text();
  console.log(`${label}: HTTP ${res.status} ${text}`);
  return { status: res.status, text };
}

const eventId = randomUUID();
const raw = body(eventId);
const t = Math.floor(Date.now() / 1000);
const v1 = signSeoAgentBody(secret, t, raw);

const happy = await post('happy', raw, {
  Authorization: `Bearer ${token}`,
  'X-SeoBot-Signature': `t=${t},v1=${v1}`,
  'X-SeoBot-Event-Id': eventId,
});
if (happy.status !== 200) process.exit(1);

const replay = await post('replay', raw, {
  Authorization: `Bearer ${token}`,
  'X-SeoBot-Signature': `t=${t},v1=${v1}`,
  'X-SeoBot-Event-Id': eventId,
});
if (replay.status !== 200 || !replay.text.includes('"skipped"')) process.exit(1);

const badBearer = await post('bad-bearer', raw, {
  Authorization: 'Bearer wrong',
  'X-SeoBot-Signature': `t=${t},v1=${v1}`,
  'X-SeoBot-Event-Id': eventId,
});
if (badBearer.status !== 401) process.exit(1);

const tampered = await post('tampered-signature', raw, {
  Authorization: `Bearer ${token}`,
  'X-SeoBot-Signature': `t=${t},v1=${'ab'.repeat(32)}`,
  'X-SeoBot-Event-Id': eventId,
});
if (tampered.status !== 401) process.exit(1);

const staleT = t - SEO_AGENT_MAX_SKEW_SECONDS - 30;
const stale = await post('stale-timestamp', raw, {
  Authorization: `Bearer ${token}`,
  'X-SeoBot-Signature': `t=${staleT},v1=${signSeoAgentBody(secret, staleT, raw)}`,
  'X-SeoBot-Event-Id': eventId,
});
if (stale.status !== 401) process.exit(1);

const mismatch = await post('event-id-mismatch', raw, {
  Authorization: `Bearer ${token}`,
  'X-SeoBot-Signature': `t=${t},v1=${v1}`,
  'X-SeoBot-Event-Id': randomUUID(),
});
if (mismatch.status !== 400) process.exit(1);

console.log('seo-agent webhook HTTP tests passed');
