import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as notificationService from '../services/notification.service.js';
const router = Router();
router.get('/', auth, async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = await notificationService.getUserNotifications(req.user.id, Number(page), Number(limit));
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.get('/unread-count', auth, async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        res.json({ success: true, data: { count } });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.put('/read-all', auth, async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.put('/:id/read', auth, async (req, res, next) => {
    try {
        await notificationService.markAsRead(req.params.id, req.user.id);
        res.json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
export default router;
