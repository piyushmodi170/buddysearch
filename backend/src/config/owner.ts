/** The only account that may use /admin and /api/admin. */
export const OWNER_EMAIL = 'piyushmodi170@gmail.com';

export const isOwnerEmail = (email?: string | null): boolean =>
  String(email || '').trim().toLowerCase() === OWNER_EMAIL;
