import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema, otpSendSchema, otpVerifySchema } from '../utils/validators.js';
import * as authService from '../services/auth.service.js';

const router = Router();

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
    const data = await authService.login(req.body.phone, req.body.password);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

router.post('/otp/send', validate(otpSendSchema), async (req, res, next) => {
  try {
    await authService.sendOTPService(req.body.phone);
    res.json({ success: true, message: 'OTP sent' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/otp/verify', validate(otpVerifySchema), async (req, res, next) => {
  try {
    const data = await authService.verifyOTPService(req.body.phone, req.body.code);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
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
