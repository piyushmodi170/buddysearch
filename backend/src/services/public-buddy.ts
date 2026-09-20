/** Fields other members must never receive on Find, discover, or peer profiles. */
export const PEER_SECRET_FIELDS = [
  'passwordHash',
  'email',
  'phone',
  'googleId',
  'aadhaarUrl',
  'isAdmin',
  'banned',
  'emailVerified',
] as const;

/** Drop account/PII fields if a query accidentally selected the full User document. */
export const toPublicBuddy = (buddy: Record<string, unknown>) => {
  const copy: Record<string, unknown> = { ...buddy };
  for (const key of PEER_SECRET_FIELDS) {
    delete copy[key];
  }
  return copy;
};
