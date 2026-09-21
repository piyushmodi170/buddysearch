import { isOwnerEmail } from '../config/owner.js';

/** Park an unverified email/password reservation so Google can create a clean account. */
export const parkedUnverifiedEmail = (userId: string) =>
  `unverified-${userId}@invalid.local`;

/**
 * Google may attach to an existing row only when that mailbox is already proven.
 * Unverified email/password signups must not receive the victim's Google login —
 * that would let the squatter keep the password and share the account.
 */
export const canAttachGoogleToExistingUser = (user: {
  email?: string | null;
  emailVerified?: boolean | null;
  googleId?: string | null;
}) =>
  Boolean(user?.emailVerified) ||
  Boolean(user?.googleId) ||
  isOwnerEmail(user?.email);
