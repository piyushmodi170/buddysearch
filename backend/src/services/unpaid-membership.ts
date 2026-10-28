/** Signup default: BASIC with no expiry. STAR also has no expiry, so check the name. */
export const isUnpaidMembershipRow = (user?: {
  membershipPlan?: string | null;
  membershipExpiry?: Date | string | null;
} | null) => {
  if (!user) return false;
  const plan = String(user.membershipPlan || 'BASIC').toUpperCase();
  return plan === 'BASIC' && !user.membershipExpiry;
};
