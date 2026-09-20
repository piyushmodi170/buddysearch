import { Router } from 'express';
import { publicSafeError } from '../config/db-errors.js';
import {
  getPublishedSeoAgentArticleBySlug,
  listPublishedSeoAgentArticles,
} from '../services/seo-agent.service.js';

const router = Router();

const toPublic = (row: Awaited<ReturnType<typeof listPublishedSeoAgentArticles>>[number]) => ({
  id: row.externalId,
  slug: row.slug,
  title: row.title,
  description: row.metaDescription,
  contentHtml: row.contentHtml,
  imageUrl: row.imageUrl,
  tags: row.tags,
  author: row.author,
  category: row.category,
  featured: row.featured,
  readTimeMinutes: row.readTimeMinutes,
  date: row.sourceCreatedAt.toISOString().slice(0, 10),
  status: 'published',
});

router.get('/articles', async (_req, res) => {
  try {
    const articles = (await listPublishedSeoAgentArticles()).map(toPublic);
    res.json({ success: true, data: { articles } });
  } catch (err) {
    res.status(500).json({ success: false, message: publicSafeError(err, 'Could not load articles') });
  }
});

router.get('/articles/:slug', async (req, res) => {
  try {
    const article = await getPublishedSeoAgentArticleBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, data: { article: toPublic(article) } });
  } catch (err) {
    res.status(500).json({ success: false, message: publicSafeError(err, 'Could not load article') });
  }
});

export default router;
