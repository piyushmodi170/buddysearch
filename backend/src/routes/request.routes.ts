import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requirePaid } from '../middleware/requirePaid.js';
import { validate } from '../middleware/validate.js';
import { createRequestSchema, updateRequestSchema, createOfferSchema } from '../utils/validators.js';
import * as requestService from '../services/request.service.js';

const router = Router();

router.get('/usage', auth, async (req, res, next) => {
  try {
    const data = await requestService.getPostUsage(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/', auth, requirePaid, validate(createRequestSchema), async (req, res, next) => {
  try {
    const data = await requestService.createRequestService(req.user!.id, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await requestService.getMyRequestsService(req.user!.id, Number(page), Number(limit));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/marketplace', auth, requirePaid, async (req, res, next) => {
  try {
    const { category, location, search, page = 1, limit = 20 } = req.query;
    const data = await requestService.getMarketplaceRequestsService({ category, location, search }, Number(page), Number(limit));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const data = await requestService.getRequestService(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.put('/:id', auth, validate(updateRequestSchema), async (req, res, next) => {
  try {
    const data = await requestService.updateRequestService(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await requestService.deleteRequestService(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Request deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/offer', auth, requirePaid, validate(createOfferSchema), async (req, res, next) => {
  try {
    const data = await requestService.createOfferService(req.params.id, req.user!.id, req.body.message);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
