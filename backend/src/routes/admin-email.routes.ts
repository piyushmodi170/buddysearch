import { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { publicSafeError } from '../config/db-errors.js';
import * as mail from '../services/mail.service.js';

const router = Router();

router.get('/email/templates', adminAuth, async (_req, res) => {
  try {
    const data = await mail.listTemplates();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not load templates') });
  }
});

router.post('/email/templates', adminAuth, async (req, res) => {
  try {
    const data = await mail.createMarketingTemplate(req.body || {});
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not create template') });
  }
});

router.put('/email/templates/:id', adminAuth, async (req, res) => {
  try {
    const data = await mail.updateTemplate(req.params.id, req.body || {});
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not save template') });
  }
});

router.delete('/email/templates/:id', adminAuth, async (req, res) => {
  try {
    const data = await mail.deleteTemplate(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not delete template') });
  }
});

router.post('/email/templates/test', adminAuth, async (req, res) => {
  try {
    const data = await mail.sendTemplatePreview({
      to: req.body?.to,
      subject: req.body?.subject,
      body: req.body?.body,
      slug: req.body?.slug,
    });
    res.json({ success: true, data, message: `Preview sent to ${data.to}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, error?.message || 'Could not send test') });
  }
});

router.post('/email/smtp/verify', adminAuth, async (_req, res) => {
  try {
    const data = await mail.verifySmtpConnection();
    res.json({ success: true, data, message: 'SMTP connection works' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, error?.message || 'SMTP connection failed') });
  }
});

router.get('/email/incomplete-count', adminAuth, async (_req, res) => {
  try {
    const count = await mail.incompleteProfileCount();
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not count users') });
  }
});

router.post('/email/remind-incomplete', adminAuth, async (_req, res) => {
  try {
    const data = await mail.sendIncompleteReminders();
    res.json({ success: true, data, message: `Sent ${data.sent} reminder${data.sent === 1 ? '' : 's'}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not send reminders') });
  }
});

router.get('/email/audience-count', adminAuth, async (req, res) => {
  try {
    const audience = String(req.query.audience || 'active') as mail.CampaignAudience;
    const emails = String(req.query.emails || '')
      .split(/[,\n;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    const count = await mail.countAudience(audience, emails);
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not count audience') });
  }
});

router.post('/email/campaign', adminAuth, async (req, res) => {
  try {
    const audience = (req.body?.audience || 'active') as mail.CampaignAudience;
    const emails = Array.isArray(req.body?.emails)
      ? req.body.emails
      : String(req.body?.customEmails || '')
          .split(/[,\n;]+/)
          .map((e: string) => e.trim())
          .filter(Boolean);
    const data = await mail.sendCampaign({
      audience,
      emails,
      subject: req.body?.subject,
      body: req.body?.body,
      slug: req.body?.slug,
    });
    res.json({
      success: true,
      data,
      message: `Sent ${data.sent} of ${data.total} emails${data.failed ? ` (${data.failed} failed)` : ''}`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Could not send campaign') });
  }
});

export default router;
