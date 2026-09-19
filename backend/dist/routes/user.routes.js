import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../utils/validators.js';
import * as userService from '../services/user.service.js';
import { uploadAvatar, uploadAadhaar } from '../middleware/upload.js';
import * as matchingService from '../services/matching.service.js';
const router = Router();
router.get('/profile', auth, async (req, res, next) => {
    try {
        const profile = await userService.getProfile(req.user.id);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
router.put('/profile', auth, validate(updateProfileSchema), async (req, res, next) => {
    try {
        const profile = await userService.updateProfile(req.user.id, req.body);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.post('/avatar', auth, uploadAvatar, async (req, res, next) => {
    try {
        if (!req.file)
            throw new Error('No file uploaded');
        const profile = await userService.uploadAvatarService(req.user.id, req.file);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.post('/aadhaar', auth, uploadAadhaar, async (req, res, next) => {
    try {
        if (!req.file)
            throw new Error('No file uploaded');
        const profile = await userService.uploadAadhaarService(req.user.id, req.file);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.put('/interests', auth, async (req, res, next) => {
    try {
        await userService.updateInterestsService(req.user.id, req.body.interestIds || []);
        res.json({ success: true, message: 'Interests updated' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.get('/discover', auth, async (req, res, next) => {
    try {
        const { tab = 'for-you', page = 1, limit = 20, city, search } = req.query;
        const filterCity = typeof city === 'string' ? city : undefined;
        const filterSearch = typeof search === 'string' ? search : undefined;
        const data = await matchingService.discoverBuddies(req.user.id, { city: filterCity, search: filterSearch }, tab, Number(page), Number(limit));
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
router.get('/:id', auth, async (req, res, next) => {
    try {
        const profile = await userService.getProfile(req.params.id);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
export default router;
