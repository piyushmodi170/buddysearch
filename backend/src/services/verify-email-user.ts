/** Fields the verify-email client needs. Never include phone, Aadhaar, hashes, or Google id. */
export const verifyEmailClientUser = (user: {
  name?: string | null;
  email?: string | null;
  onboardingCompleted?: boolean | null;
}) => ({
  name: user.name || '',
  email: user.email || '',
  emailVerified: true as const,
  onboardingCompleted: Boolean(user.onboardingCompleted),
});
