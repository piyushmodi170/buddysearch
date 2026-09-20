import { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { publicSafeError } from '../config/db-errors.js';
import {
  listSeoAgentArticlesForAdmin,
  setSeoAgentArticleStatus,
} from '../services/seo-agent.service.js';

const router = Router();

router.get('/seo-articles', adminAuth, async (_req, res) => {
  try {
    const articles = await listSeoAgentArticlesForAdmin();
    res.json({ success: true, data: { articles } });
  } catch (error) {
    res.status(500).json({ success: false, message: publicSafeError(error, 'Could not load SEO articles') });
  }
});

router.post('/seo-articles/:externalId/publish', adminAuth, async (req, res) => {
  try {
    const article = await setSeoAgentArticleStatus(req.params.externalId, 'published');
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not publish article') });
  }
});

router.post('/seo-articles/:externalId/unpublish', adminAuth, async (req, res) => {
  try {
    const article = await setSeoAgentArticleStatus(req.params.externalId, 'draft');
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not unpublish article') });
  }
});

export default router;
