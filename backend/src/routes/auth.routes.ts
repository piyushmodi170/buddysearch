import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../utils/validators.js';
import * as authService from '../services/auth.service.js';
import { getSetting } from '../config/settings.js';

const router = Router();

router.get('/google/config', async (_req, res) => {
  const fromEnv = process.env.GOOGLE_CLIENT_ID || '';
  if (fromEnv) {
    return res.json({
      success: true,
      data: { clientId: fromEnv, configured: true },
    });
  }
  try {
    const google = await getSetting('google');
    res.json({
      success: true,
      data: {
        clientId: google.clientId || '',
        configured: Boolean(google.clientId),
      }
    });
  } catch {
    res.json({ success: true, data: { clientId: '', configured: false } });
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google identity token is required' });
    }
    const data = await authService.googleAuthService(idToken);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const data = await authService.signup(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const data = await authService.login(req.body.email, req.body.password);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const data = await authService.refreshTokenService(refreshToken);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

export default router;
