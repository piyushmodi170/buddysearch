import crypto from 'crypto';

export const SEO_AGENT_MAX_SKEW_SECONDS = 300;

export type SeoAgentArticleInput = {
  id: string;
  title: string;
  slug: string;
  content_markdown: string;
  content_html: string;
  meta_description: string;
  image_url: string;
  tags: string[];
  created_at: string;
};

export type SeoAgentPayload = {
  event_type: string;
  event_id: string;
  version: string;
  action?: 'create' | 'update';
  timestamp: string;
  data: { articles: SeoAgentArticleInput[] };
};

export type VerifyFailure = { ok: false; status: 400 | 401; message: string };
export type VerifySuccess = { ok: true; payload: SeoAgentPayload; raw: Buffer };
export type VerifyResult = VerifyFailure | VerifySuccess;

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

export function parseSignatureHeader(header: string | undefined): { t: number; v1: string } | null {
  if (!header) return null;
  const parts: Record<string, string> = {};
  for (const piece of header.split(',')) {
    const idx = piece.indexOf('=');
    if (idx <= 0) continue;
    parts[piece.slice(0, idx).trim()] = piece.slice(idx + 1).trim();
  }
  const t = Number(parts.t);
  const v1 = parts.v1 || '';
  if (!Number.isFinite(t) || !v1) return null;
  return { t, v1 };
}

export function timingSafeHexEqual(expectedHex: string, receivedHex: string): boolean {
  const a = Buffer.from(expectedHex, 'hex');
  const b = Buffer.from(receivedHex, 'hex');
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function timingSafeStringEqual(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length === 0 || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function signSeoAgentBody(secret: string, timestampUnix: number, rawBody: Buffer | string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${timestampUnix}.`);
  hmac.update(rawBody);
  return hmac.digest('hex');
}

export function isUniqueConflict(err: unknown): boolean {
  const anyErr = err as { code?: string; message?: string } | undefined;
  if (anyErr?.code === 'P2002') return true;
  return /E11000|duplicate key/i.test(String(anyErr?.message || err || ''));
}

function isArticle(value: unknown): value is SeoAgentArticleInput {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return Boolean(asString(row.id) && asString(row.title) && asString(row.slug));
}

export function parseSeoAgentPayload(raw: Buffer): SeoAgentPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString('utf8'));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const body = parsed as Record<string, unknown>;
  const data = body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>) : null;
  const articles = Array.isArray(data?.articles) ? data!.articles.filter(isArticle) : [];
  if (asString(body.event_type) !== 'publish_articles') return null;
  if (asString(body.version) !== '1') return null;
  if (!asString(body.event_id)) return null;
  if (!articles.length) return null;
  const action = body.action === 'update' || body.action === 'create' ? body.action : undefined;
  return {
    event_type: 'publish_articles',
    event_id: asString(body.event_id),
    version: '1',
    action,
    timestamp: asString(body.timestamp),
    data: {
      articles: articles.map((article) => ({
        id: asString(article.id),
        title: asString(article.title),
        slug: asString(article.slug),
        content_markdown: asString(article.content_markdown),
        content_html: asString(article.content_html),
        meta_description: asString(article.meta_description),
        image_url: asString(article.image_url),
        tags: Array.isArray(article.tags) ? article.tags.map((tag) => String(tag)).filter(Boolean) : [],
        created_at: asString(article.created_at) || new Date().toISOString(),
      })),
    },
  };
}

export function verifySeoAgentRequest(input: {
  rawBody: Buffer;
  authorization?: string;
  signature?: string;
  eventIdHeader?: string;
  accessToken: string;
  signingSecret: string;
  nowMs?: number;
}): VerifyResult {
  const { rawBody, accessToken, signingSecret } = input;
  if (!accessToken || !signingSecret) {
    return { ok: false, status: 401, message: 'Webhook is not configured' };
  }

  const bearer = asString(input.authorization);
  const token = bearer.toLowerCase().startsWith('bearer ') ? bearer.slice(7).trim() : '';
  if (!timingSafeStringEqual(accessToken, token)) {
    return { ok: false, status: 401, message: 'Invalid bearer token' };
  }

  const parsedSig = parseSignatureHeader(input.signature);
  if (!parsedSig) {
    return { ok: false, status: 401, message: 'Invalid signature header' };
  }

  const nowUnix = Math.floor((input.nowMs ?? Date.now()) / 1000);
  if (Math.abs(nowUnix - parsedSig.t) > SEO_AGENT_MAX_SKEW_SECONDS) {
    return { ok: false, status: 401, message: 'Stale timestamp' };
  }

  const expected = signSeoAgentBody(signingSecret, parsedSig.t, rawBody);
  if (!timingSafeHexEqual(expected, parsedSig.v1)) {
    return { ok: false, status: 401, message: 'Invalid signature' };
  }

  const payload = parseSeoAgentPayload(rawBody);
  if (!payload) {
    return { ok: false, status: 400, message: 'Malformed body' };
  }

  const headerEventId = asString(input.eventIdHeader);
  if (!headerEventId || headerEventId !== payload.event_id) {
    return { ok: false, status: 400, message: 'event_id mismatch' };
  }

  return { ok: true, payload, raw: rawBody };
}

export function readTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const SEO_AGENT_DEFAULTS = {
  author: 'Buddy Search Editorial',
  category: 'Guides',
  featured: false,
  status: 'draft' as const,
};
