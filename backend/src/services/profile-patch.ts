const PROFILE_IDENTITY_KEYS = new Set([
  'email',
  'passwordHash',
  'isAdmin',
  'membershipPlan',
  'membershipExpiry',
  'verified',
  'emailVerified',
  'banned',
  'googleId',
  'id',
  '_id',
]);

/** Drop identity/privilege fields so PUT /profile cannot steal an email or self-promote. */
export const sanitizeProfilePatch = (data: Record<string, unknown> | null | undefined) => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (PROFILE_IDENTITY_KEYS.has(key) || key.startsWith('$')) continue;
    out[key] = value;
  }
  return out;
};
