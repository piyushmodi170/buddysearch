import { isOwnerEmail } from '../config/owner.js';

type SessionClaims = {
  email?: string | null;
  emailVerified?: boolean;
  isAdmin?: boolean;
};

/**
 * Signup currently mints a JWT before the mailbox OTP is entered. The SPA
 * hides Hire/Find/chat, but every /api/* route that uses `auth` would still
 * accept that token. Treat an explicit `emailVerified: false` claim as blocked.
 * Tokens minted before this claim existed omit the field and stay valid.
 */
export const accessDeniedUntilEmailVerified = (user?: SessionClaims | null) => {
  if (!user) return false;
  if (user.isAdmin || isOwnerEmail(user.email)) return false;
  return user.emailVerified === false;
};
