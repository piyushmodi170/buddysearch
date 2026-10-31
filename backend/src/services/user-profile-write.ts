/** Fields a member may persist through profile / onboarding / uploads. Login identity and privilege flags are excluded. */
const PROFILE_WRITE_FIELDS = new Set([
  'name',
  'phone',
  'bio',
  'city',
  'state',
  'pincode',
  'instagram',
  'facebook',
  'linkedin',
  'twitter',
  'lat',
  'lng',
  'role',
  'availableForRequests',
  'gender',
  'onboardingCompleted',
  'avatar',
  'aadhaarUrl',
  'profileCompletion',
]);

export const profileWriteData = (data: Record<string, unknown> | null | undefined) => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (PROFILE_WRITE_FIELDS.has(key) && value !== undefined) out[key] = value;
  }
  return out;
};
