/** The only account that may use /admin and /api/admin. */
export const OWNER_EMAIL = 'piyushmodi170@gmail.com';

/** Written by an old `prisma db seed`. Public in the repo — never accept it. */
export const PUBLISHED_SEED_PASSWORD = 'admin123';

export const isOwnerEmail = (email?: string | null): boolean =>
  String(email || '').trim().toLowerCase() === OWNER_EMAIL;

export const isPublishedSeedPassword = (email?: string | null, password?: string | null): boolean =>
  isOwnerEmail(email) && String(password || '') === PUBLISHED_SEED_PASSWORD;
