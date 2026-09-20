/**
 * The SEO Agent webhook (Mode A — Mongo upsert, drafts until published).
 *
 * Public URL to paste in The SEO Agent → Integrations → Webhook endpoint:
 *   https://buddysearch.online/api/webhooks/seo-agent
 *
 * Env vars (Coolify runtime only — never commit values):
 *   SEO_AGENT_ACCESS_TOKEN
 *   SEO_AGENT_SIGNING_SECRET
 *
 * Local verify (from repo root, backend on :4000):
 *   npx tsx src/webhooks/seo-agent.test.ts
 *   npx tsx scripts/seo-agent-webhook-test.ts
 *
 * A successful webhook writes a **draft**. It will not show on /blog until the
 * owner publishes it at /admin/seo-articles (or POST
 * /api/admin/seo-articles/:externalId/publish).
 */
import { Router, type Request } from 'express';
import { config } from '../config/index.js';
import { publicSafeError } from '../config/db-errors.js';
import {
  claimSeoAgentEvent,
  releaseSeoAgentEvent,
  upsertSeoAgentArticles,
} from '../services/seo-agent.service.js';
import { verifySeoAgentRequest } from '../webhooks/seo-agent.js';

const router = Router();

const header = (req: Request, name: string) => {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || '') : String(value || '');
};

router.post('/seo-agent', async (req, res) => {
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
  const raw: Buffer = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

  const verified = verifySeoAgentRequest({
    rawBody: raw,
    authorization: header(req, 'authorization'),
    signature: header(req, 'x-seobot-signature'),
    eventIdHeader: header(req, 'x-seobot-event-id'),
    accessToken: config.seoAgent.accessToken,
    signingSecret: config.seoAgent.signingSecret,
  });

  if (!verified.ok) {
    return res.status(verified.status).json({ success: false, message: verified.message });
  }

  const ids = verified.payload.data.articles.map((article) => article.id);
  try {
    const claim = await claimSeoAgentEvent(verified.payload.event_id);
    if (claim === 'duplicate') {
      return res.status(200).json({ created: [], updated: [], skipped: ids });
    }
    try {
      const result = await upsertSeoAgentArticles(verified.payload);
      return res.status(200).json(result);
    } catch (err) {
      await releaseSeoAgentEvent(verified.payload.event_id);
      throw err;
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: publicSafeError(err, 'Could not store SEO Agent articles'),
    });
  }
});

export default router;
