import { isOwnerEmail } from '../config/owner.js';

const ownerEnvPassword = () =>
  process.env.ADMIN_PASSWORD || process.env.OWNER_PASSWORD || '';

/**
 * Bootstrap / break-glass only. The public owner email is not a password —
 * accepting `pass === email` let anyone mint an admin session and overwrite
 * the stored hash (including Google-only owner accounts).
 */
export const ownerEnvPasswordMatches = (email: string, pass: string) => {
  const fromEnv = ownerEnvPassword();
  return Boolean(fromEnv) && isOwnerEmail(email) && pass === fromEnv;
};
