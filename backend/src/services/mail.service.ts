import { prisma } from '../config/db.js';
import { getSetting } from '../config/settings.js';
import { DEFAULT_EMAIL_TEMPLATES, renderVars, wrapEmailHtml, SAMPLE_PREVIEW_VARS, type MailVars } from '../config/email-templates.js';

type Transport = {
  sendMail: (opts: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) => Promise<unknown>;
  verify?: () => Promise<boolean>;
};

const stripHtml = (html: string) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatFrom = (from: string, fromName?: string) => {
  if (!from) return from;
  if (from.includes('<')) return from;
  const name = String(fromName || 'BuddySearch').replace(/"/g, '');
  return `"${name}" <${from}>`;
};

export const loadTransport = async (): Promise<{ transport: Transport; from: string; fromName: string }> => {
  const smtp = await getSetting('smtp');
  if (!smtp.host || !smtp.from) {
    throw new Error('SMTP is not configured. Open Admin → Email and save host + from email.');
  }

  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port || 587,
    secure: smtp.secure || smtp.port === 465,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  });

  return { transport, from: formatFrom(smtp.from, smtp.fromName), fromName: smtp.fromName || 'BuddySearch' };
};

export const smtpConfigured = async () => {
  const smtp = await getSetting('smtp');
  return Boolean(smtp.host && smtp.from);
};

export const verifySmtpConnection = async () => {
  const { transport } = await loadTransport();
  if (typeof transport.verify === 'function') {
    await transport.verify();
  }
  return { ok: true };
};

const appContext = async () => {
  const app = await getSetting('app');
  return {
    appName: 'BuddySearch',
    appUrl: String(app.url || process.env.FRONTEND_URL || 'https://buddysearch.online').replace(/\/$/, ''),
  };
};

export const ensureDefaultTemplates = async () => {
  for (const tpl of DEFAULT_EMAIL_TEMPLATES) {
    const existing = await prisma.emailTemplate.findUnique({ where: { slug: tpl.slug } });
    if (!existing) {
      await prisma.emailTemplate.create({ data: tpl });
      continue;
    }
    const shouldUpgradeOtp =
      (tpl.slug === 'email-otp' || tpl.slug === 'password-reset') &&
      !existing.body.includes('{{code}}');
    if (shouldUpgradeOtp) {
      await prisma.emailTemplate.update({
        where: { slug: tpl.slug },
        data: { subject: tpl.subject, body: tpl.body },
      });
    }
  }
};

export const listTemplates = async () => {
  await ensureDefaultTemplates();
  return prisma.emailTemplate.findMany({ orderBy: { createdAt: 'asc' } });
};

export const getTemplateBySlug = async (slug: string) => {
  await ensureDefaultTemplates();
  return prisma.emailTemplate.findUnique({ where: { slug } });
};

const logSend = async (row: { to: string; subject: string; slug?: string; status: 'SENT' | 'FAILED'; error?: string }) => {
  try {
    await prisma.emailLog.create({ data: row });
  } catch {
    /* logging must never block mail */
  }
};

export const sendRawEmail = async (opts: { to: string; subject: string; html: string; slug?: string; vars?: MailVars }) => {
  const to = String(opts.to || '').trim().toLowerCase();
  if (!to.includes('@')) throw new Error('Enter a valid recipient email');
  const ctx = await appContext();
  const vars: MailVars = {
    ...ctx,
    logoUrl: `${ctx.appUrl}/logo.png`,
    ...(opts.vars || {}),
  };
  const subject = renderVars(opts.subject, vars);
  const inner = renderVars(opts.html, vars);
  const looksHtml = /<[a-z][\s\S]*>/i.test(inner);
  const htmlInner = looksHtml ? inner : inner.split('\n').map((line) => `<p>${line || '&nbsp;'}</p>`).join('');
  const html = /<html/i.test(inner) ? inner : wrapEmailHtml(htmlInner, ctx.appName, ctx.appUrl);
  const text = stripHtml(inner);
  const { transport, from } = await loadTransport();
  try {
    await transport.sendMail({ from, to, subject, text, html });
    await logSend({ to, subject, slug: opts.slug, status: 'SENT' });
  } catch (err: any) {
    const message = err?.message || 'Failed to send email';
    await logSend({ to, subject, slug: opts.slug, status: 'FAILED', error: String(message).slice(0, 400) });
    throw new Error(message);
  }
  return { to, subject };
};

export const sendTemplate = async (slug: string, to: string, vars: MailVars = {}) => {
  const tpl = await getTemplateBySlug(slug);
  if (!tpl) throw new Error(`Email template "${slug}" is missing`);
  if (!tpl.active) return { skipped: true as const, reason: 'template disabled' };
  return sendRawEmail({ to, subject: tpl.subject, html: tpl.body, slug, vars });
};

export const sendTransactional = async (slug: string, to: string, vars: MailVars = {}) => {
  try {
    if (!(await smtpConfigured())) return { skipped: true as const, reason: 'smtp not configured' };
    return await sendTemplate(slug, to, vars);
  } catch (err: any) {
    console.error('[mail]', slug, to, err?.message || err);
    return { skipped: true as const, reason: err?.message || 'send failed' };
  }
};

export const sendTestEmail = async (to: string) => {
  const ctx = await appContext();
  return sendRawEmail({
    to,
    subject: `${ctx.appName} SMTP test`,
    html: `<p>This is a test email from the BuddySearch admin panel. SMTP is working.</p><p>App URL: ${ctx.appUrl}</p>`,
    slug: 'smtp-test',
    vars: { name: 'Admin' },
  });
};

export const sendTemplatePreview = async (opts: { to: string; subject: string; body: string; slug?: string }) => {
  return sendRawEmail({
    to: opts.to,
    subject: opts.subject || 'BuddySearch email preview',
    html: opts.body || '<p>Empty template</p>',
    slug: opts.slug || 'template-test',
    vars: SAMPLE_PREVIEW_VARS,
  });
};

export type CampaignAudience = 'all' | 'active' | 'incomplete' | 'unpaid' | 'paid' | 'custom';

const audienceWhere = (audience: CampaignAudience) => {
  if (audience === 'incomplete') {
    return { banned: false, OR: [{ onboardingCompleted: false }, { profileCompletion: { lt: 60 } }] };
  }
  if (audience === 'unpaid') {
    return {
      banned: false,
      isAdmin: false,
      membershipPlan: { not: 'STAR' as const },
      membershipExpiry: null,
    };
  }
  if (audience === 'paid') {
    return {
      banned: false,
      OR: [
        { membershipPlan: 'STAR' as const },
        { membershipExpiry: { gt: new Date() } },
      ],
    };
  }
  return { banned: false };
};

export const countAudience = async (audience: CampaignAudience, emails?: string[]) => {
  if (audience === 'custom') {
    const list = (emails || []).map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@'));
    return list.length;
  }
  return prisma.user.count({ where: audienceWhere(audience) });
};

export const incompleteProfileCount = async () =>
  prisma.user.count({ where: audienceWhere('incomplete') });

export const unpaidMembershipCount = async () =>
  prisma.user.count({ where: audienceWhere('unpaid') });

const recipientsFor = async (audience: CampaignAudience, emails?: string[]) => {
  if (audience === 'custom') {
    const list = Array.from(new Set((emails || []).map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@'))));
    const users = await prisma.user.findMany({
      where: { email: { in: list } },
      select: { email: true, name: true, membershipPlan: true },
    });
    const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
    return list.map((email) => ({
      email,
      name: byEmail.get(email)?.name || email.split('@')[0],
      membershipPlan: byEmail.get(email)?.membershipPlan || '',
    }));
  }
  const users = await prisma.user.findMany({
    where: audienceWhere(audience),
    select: { email: true, name: true, membershipPlan: true },
    take: 200,
  });
  return users.filter((u) => u.email?.includes('@'));
};

export const sendCampaign = async (opts: {
  audience: CampaignAudience;
  emails?: string[];
  subject: string;
  body: string;
  slug?: string;
}) => {
  const subject = String(opts.subject || '').trim();
  const body = String(opts.body || '').trim();
  if (!subject || !body) throw new Error('Subject and email body are required');
  const recipients = await recipientsFor(opts.audience, opts.emails);
  if (!recipients.length) throw new Error('No recipients in this audience');

  let sent = 0;
  let failed = 0;
  for (const user of recipients) {
    try {
      await sendRawEmail({
        to: user.email,
        subject,
        html: body,
        slug: opts.slug || 'campaign',
        vars: {
          name: user.name || 'there',
          email: user.email,
          plan: user.membershipPlan || '',
        },
      });
      sent += 1;
    } catch {
      failed += 1;
    }
  }
  return { sent, failed, total: recipients.length };
};

export const sendIncompleteReminders = async () => {
  const tpl = await getTemplateBySlug('incomplete-profile');
  if (!tpl?.active) throw new Error('Incomplete profile template is disabled');
  return sendCampaign({
    audience: 'incomplete',
    subject: tpl.subject,
    body: tpl.body,
    slug: 'incomplete-profile',
  });
};

export const sendUnpaidReminders = async () => {
  const tpl = await getTemplateBySlug('unpaid-membership');
  if (!tpl?.active) throw new Error('No-subscription template is disabled');
  return sendCampaign({
    audience: 'unpaid',
    subject: tpl.subject,
    body: tpl.body,
    slug: 'unpaid-membership',
  });
};

export const createMarketingTemplate = async (data: { name: string; description?: string; subject: string; body: string }) => {
  const name = String(data.name || '').trim();
  if (name.length < 2) throw new Error('Template name is required');
  const slug = `marketing-${Date.now()}`;
  return prisma.emailTemplate.create({
    data: {
      slug,
      name,
      description: String(data.description || '').trim(),
      kind: 'MARKETING',
      subject: String(data.subject || '').trim() || 'Hello from {{appName}}',
      body: String(data.body || '').trim() || '<p>Hi {{name}},</p>',
      active: true,
    },
  });
};

export const updateTemplate = async (
  id: string,
  patch: { name?: string; description?: string; subject?: string; body?: string; active?: boolean }
) => {
  const current = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!current) throw new Error('Template not found');
  return prisma.emailTemplate.update({
    where: { id },
    data: {
      name: patch.name != null ? String(patch.name).trim() : undefined,
      description: patch.description != null ? String(patch.description).trim() : undefined,
      subject: patch.subject != null ? String(patch.subject) : undefined,
      body: patch.body != null ? String(patch.body) : undefined,
      active: patch.active,
    },
  });
};

export const deleteTemplate = async (id: string) => {
  const current = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!current) throw new Error('Template not found');
  if (current.kind === 'SYSTEM') throw new Error('System templates cannot be deleted');
  await prisma.emailTemplate.delete({ where: { id } });
  return { ok: true };
};
