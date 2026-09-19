import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { sendTransactional, smtpConfigured } from './mail.service.js';
import { isOwnerEmail } from '../config/owner.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_MS = 45_000;

const sixDigit = () => String(Math.floor(100000 + Math.random() * 900000));

export const mailboxVerified = (user: { emailVerified?: boolean | null; googleId?: string | null; email?: string | null }) =>
  Boolean(user?.emailVerified) || Boolean(user?.googleId) || isOwnerEmail(user?.email);

const issueOtp = async (email: string, purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD') => {
  const recent = await prisma.emailOtp.findFirst({
    where: { email, purpose, used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (recent && Date.now() - new Date(recent.createdAt).getTime() < RESEND_MS) {
    throw new Error('Please wait a minute before requesting another code');
  }
  await prisma.emailOtp.updateMany({ where: { email, purpose, used: false }, data: { used: true } });
  const code = sixDigit();
  await prisma.emailOtp.create({
    data: { email, code, purpose, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  return code;
};

const consumeOtp = async (email: string, purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD', code: string) => {
  const otp = String(code || '').replace(/\D/g, '');
  if (otp.length !== 6) throw new Error('Enter the 6-digit code from your email');
  const row = await prisma.emailOtp.findFirst({
    where: { email, purpose, used: false, code: otp },
    orderBy: { createdAt: 'desc' },
  });
  if (!row) throw new Error('That code is invalid. Request a new one.');
  if (row.expiresAt.getTime() < Date.now()) throw new Error('That code expired. Request a new one.');
  await prisma.emailOtp.update({ where: { id: row.id }, data: { used: true } });
};

export const sendWelcomeEmail = async (user: { name: string; email: string }) =>
  sendTransactional('welcome', user.email, { name: user.name, email: user.email });

export const sendSignupEmails = async (user: { name: string; email: string }) => {
  const email = user.email.toLowerCase().trim();
  const canSend = await smtpConfigured();
  if (!canSend) return { sent: false };
  const code = await issueOtp(email, 'VERIFY_EMAIL');
  await sendTransactional('email-otp', email, { name: user.name, email, otp: code });
  await sendTransactional('welcome', email, { name: user.name, email });
  return { sent: true };
};

export const resendVerification = async (emailInput: string) => {
  const email = String(emailInput || '').toLowerCase().trim();
  if (!email.includes('@')) throw new Error('Enter a valid email address');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { sent: true };
  if (mailboxVerified(user)) return { sent: true, already: true };
  if (!(await smtpConfigured())) {
    throw new Error('Email is not configured yet. Ask the site owner to save SMTP in Admin → Email.');
  }
  const code = await issueOtp(email, 'VERIFY_EMAIL');
  await sendTransactional('email-otp', email, { name: user.name, email, otp: code });
  return { sent: true };
};

export const verifyEmailCode = async (emailInput: string, code: string) => {
  const email = String(emailInput || '').toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('No account found for that email');
  if (mailboxVerified(user)) {
    return prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  }
  await consumeOtp(email, 'VERIFY_EMAIL', code);
  return prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
};

export const forgotPassword = async (emailInput: string) => {
  const email = String(emailInput || '').toLowerCase().trim();
  if (!email.includes('@')) throw new Error('Enter a valid email address');
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && (await smtpConfigured())) {
    const code = await issueOtp(email, 'RESET_PASSWORD');
    await sendTransactional('password-reset', email, { name: user.name, email, otp: code });
  }
  return { sent: true };
};

export const resetPassword = async (emailInput: string, code: string, password: string) => {
  const email = String(emailInput || '').toLowerCase().trim();
  if (String(password || '').length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('Password needs 8+ characters with a letter and a number');
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('No account found for that email');
  await consumeOtp(email, 'RESET_PASSWORD', code);
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, emailVerified: true },
  });
};
