import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../utils/validators.js';
import * as authService from '../services/auth.service.js';
import { googleAudienceIds } from '../config/settings.js';
import { isDatabaseError, publicAuthError } from '../config/db-errors.js';

const router = Router();

const authErrorMessage = (error: any, fallback: string) => publicAuthError(error, fallback);

router.get('/google/config', async (_req, res) => {
  try {
    const ids = await googleAudienceIds();
    const clientId = ids[0] || '';
    res.json({
      success: true,
      data: { clientId, configured: Boolean(clientId) },
    });
  } catch {
    res.json({ success: true, data: { clientId: '', configured: false } });
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google identity token is required' });
    }
    const data = await authService.googleAuthService(idToken, role);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: authErrorMessage(error, 'Google sign-in failed') });
  }
});

router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const data = await authService.signup(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: authErrorMessage(error, 'Unable to create your account') });
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const data = await authService.login(req.body.email, req.body.password);
    res.json({ success: true, data });
  } catch (error: any) {
    const status = isDatabaseError(error) ? 503 : 401;
    res.status(status).json({ success: false, message: authErrorMessage(error, 'Unable to sign in') });
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
