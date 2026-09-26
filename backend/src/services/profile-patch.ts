const PROFILE_FIELDS = new Set([
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
  'avatar',
  'aadhaarUrl',
  'aadhaarVerified',
  'onboardingCompleted',
]);

export const profilePatchFrom = (data: Record<string, unknown> | null | undefined) => {
  const patch: Record<string, unknown> = {};
  if (!data || typeof data !== 'object') return patch;
  for (const key of PROFILE_FIELDS) {
    if (data[key] !== undefined) patch[key] = data[key];
  }
  return patch;
};
