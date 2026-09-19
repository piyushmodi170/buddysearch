import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as membershipService from '../services/membership.service.js';
const router = Router();
router.get('/plans', async (req, res, next) => {
    try {
        const data = await membershipService.getPlans();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.get('/current', auth, async (req, res, next) => {
    try {
        const data = await membershipService.getUserPlan(req.user.id);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
export default router;
