import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as chatService from '../services/chat.service.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const data = await chatService.getUserChats(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) throw new Error('userId is required');
    const data = await chatService.getOrCreateChat(req.user!.id, userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id/messages', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const data = await chatService.getChatMessages(req.params.id, req.user!.id, Number(page), Number(limit));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
});

router.put('/:id/seen', auth, async (req, res, next) => {
  try {
    await chatService.markAsSeenService(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Messages marked as seen' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
