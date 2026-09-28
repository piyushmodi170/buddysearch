export type MembershipTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'STAR';

export const PLAN_NAMES: MembershipTier[] = ['BASIC', 'STANDARD', 'PREMIUM', 'STAR'];

const PLAN_RANK: Record<string, number> = {
  BASIC: 1,
  STANDARD: 2,
  PREMIUM: 3,
  STAR: 4,
};

export type MembershipState = {
  membershipPlan: MembershipTier;
  membershipExpiry: Date | null;
};

const asTier = (name?: string | null): MembershipTier | null => {
  const upper = String(name || '').toUpperCase();
  return PLAN_NAMES.includes(upper as MembershipTier) ? (upper as MembershipTier) : null;
};

const expiryDate = (value?: Date | string | null): Date | null => {
  if (!value) return null;
  const when = value instanceof Date ? value : new Date(value);
  return Number.isNaN(when.getTime()) ? null : when;
};

const isActiveMembership = (
  plan?: string | null,
  expiry?: Date | string | null,
  now = new Date(),
) => {
  const tier = asTier(plan);
  if (!tier) return false;
  if (tier === 'STAR') return true;
  const when = expiryDate(expiry);
  return Boolean(when && when.getTime() > now.getTime());
};

/**
 * Paid UPI confirm must never strip a better entitlement.
 * Star is lifetime; a later Basic/Standard/Premium charge must not overwrite it.
 * A still-valid higher tier keeps its name, and expiry only moves forward.
 */
export const resolveMembershipActivation = (
  current: { membershipPlan?: string | null; membershipExpiry?: Date | string | null } | null,
  purchased: { name: string; durationMonths: number },
  now = new Date(),
): MembershipState => {
  const purchasedTier = asTier(purchased.name) || 'BASIC';

  if (purchasedTier === 'STAR') {
    return { membershipPlan: 'STAR', membershipExpiry: null };
  }

  const currentTier = asTier(current?.membershipPlan);
  const currentExpiry = expiryDate(current?.membershipExpiry);
  const currentActive = isActiveMembership(currentTier, currentExpiry, now);

  if (currentActive && currentTier === 'STAR') {
    return { membershipPlan: 'STAR', membershipExpiry: null };
  }

  let nextExpiry: Date | null = null;
  if (purchased.durationMonths > 0) {
    nextExpiry = new Date(now);
    nextExpiry.setMonth(nextExpiry.getMonth() + purchased.durationMonths);
  }

  if (currentActive && currentExpiry && (!nextExpiry || currentExpiry.getTime() > nextExpiry.getTime())) {
    nextExpiry = currentExpiry;
  }

  const keepCurrentPlan = Boolean(
    currentActive && currentTier && PLAN_RANK[currentTier] > PLAN_RANK[purchasedTier],
  );

  return {
    membershipPlan: keepCurrentPlan ? currentTier! : purchasedTier,
    membershipExpiry: nextExpiry,
  };
};
