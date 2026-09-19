import { getSetting } from '../config/settings.js';

type Transport = {
  sendMail: (opts: { from: string; to: string; subject: string; text: string }) => Promise<unknown>;
};

const loadTransport = async (): Promise<{ transport: Transport; from: string }> => {
  const smtp = await getSetting('smtp');
  if (!smtp.host || !smtp.from) {
    throw new Error('SMTP is not configured');
  }

  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port || 587,
    secure: smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  });

  return { transport, from: smtp.from };
};

export const sendTestEmail = async (to: string) => {
  const target = String(to || '').trim().toLowerCase();
  if (!target.includes('@')) throw new Error('Enter a valid recipient email');
  const { transport, from } = await loadTransport();
  await transport.sendMail({
    from,
    to: target,
    subject: 'BuddySearch SMTP test',
    text: 'This is a test email from the BuddySearch admin panel. SMTP is working.',
  });
  return { to: target };
};
