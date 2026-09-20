import { prisma } from '../config/db.js';
import {
  isUniqueConflict,
  readTimeMinutes,
  SEO_AGENT_DEFAULTS,
  type SeoAgentArticleInput,
  type SeoAgentPayload,
} from '../webhooks/seo-agent.js';

export type PublishResult = {
  created: string[];
  updated: string[];
  skipped: string[];
};

const publicSelect = {
  externalId: true,
  slug: true,
  title: true,
  contentHtml: true,
  metaDescription: true,
  imageUrl: true,
  tags: true,
  author: true,
  category: true,
  featured: true,
  status: true,
  readTimeMinutes: true,
  sourceCreatedAt: true,
  updatedAt: true,
} as const;

function sourceDate(article: SeoAgentArticleInput): Date {
  const parsed = new Date(article.created_at);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function claimSeoAgentEvent(eventId: string): Promise<'claimed' | 'duplicate'> {
  try {
    await prisma.seoAgentWebhookEvent.create({ data: { eventId } });
    return 'claimed';
  } catch (err) {
    if (isUniqueConflict(err)) return 'duplicate';
    throw err;
  }
}

export async function releaseSeoAgentEvent(eventId: string) {
  await prisma.seoAgentWebhookEvent.deleteMany({ where: { eventId } });
}

export async function upsertSeoAgentArticles(
  payload: SeoAgentPayload,
): Promise<PublishResult> {
  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const article of payload.data.articles) {
    const existing = await prisma.seoAgentArticle.findUnique({
      where: { externalId: article.id },
      select: { id: true, status: true },
    });

    const data = {
      slug: article.slug,
      title: article.title,
      contentMarkdown: article.content_markdown,
      contentHtml: article.content_html,
      metaDescription: article.meta_description,
      imageUrl: article.image_url || '',
      tags: article.tags,
      author: SEO_AGENT_DEFAULTS.author,
      category: SEO_AGENT_DEFAULTS.category,
      featured: SEO_AGENT_DEFAULTS.featured,
      readTimeMinutes: readTimeMinutes(article.content_markdown || article.content_html),
      sourceCreatedAt: sourceDate(article),
      lastEventId: payload.event_id,
      ...(existing ? {} : { status: SEO_AGENT_DEFAULTS.status }),
    };

    try {
      await prisma.seoAgentArticle.upsert({
        where: { externalId: article.id },
        create: { externalId: article.id, ...data, status: SEO_AGENT_DEFAULTS.status },
        update: data,
      });
    } catch (err) {
      if (isUniqueConflict(err)) {
        skipped.push(article.id);
        continue;
      }
      throw err;
    }

    if (existing) updated.push(article.id);
    else created.push(article.id);
  }

  return { created, updated, skipped };
}

export function isPublishedStatus(status: string | null | undefined): boolean {
  return status === 'published';
}

export async function listPublishedSeoAgentArticles() {
  const rows = await prisma.seoAgentArticle.findMany({
    orderBy: { sourceCreatedAt: 'desc' },
    select: publicSelect,
  });
  return rows.filter((row) => isPublishedStatus(row.status));
}

export async function getPublishedSeoAgentArticleBySlug(slug: string) {
  const row = await prisma.seoAgentArticle.findUnique({
    where: { slug },
    select: publicSelect,
  });
  if (!row || !isPublishedStatus(row.status)) return null;
  return row;
}

export async function listSeoAgentArticlesForAdmin() {
  return prisma.seoAgentArticle.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      ...publicSelect,
      externalId: true,
      createdAt: true,
    },
  });
}

export async function setSeoAgentArticleStatus(externalId: string, status: 'draft' | 'published') {
  return prisma.seoAgentArticle.update({
    where: { externalId },
    data: { status },
    select: { externalId: true, slug: true, status: true, title: true },
  });
}
