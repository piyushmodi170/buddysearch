/** Contact and government-ID fields other members must never receive. */
const PRIVATE_PROFILE_KEYS = [
  'passwordHash',
  'email',
  'phone',
  'aadhaarUrl',
  'googleId',
  'isAdmin',
  'banned',
  'emailVerified',
] as const;

export const stripPrivateProfileFields = (user: any) => {
  if (!user) return user;
  const next = { ...user };
  for (const key of PRIVATE_PROFILE_KEYS) {
    delete next[key];
  }
  return next;
};
