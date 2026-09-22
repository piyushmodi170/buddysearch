import { prisma } from '../config/db.js';

export type MembershipTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'STAR';

/** Paid UPI membership is required. Hire, Find, chats, and posts stay locked until a plan is active. */
export const PLATFORM_ACCESS_FREE = false;

const FREE_LAUNCH_REVOKE_KEY = 'free-access-launch-revoked';

/** True when a Star row was the free-launch grant, not a confirmed payment. */
export const isUnpaidFreeLaunchStar = (
  user: { membershipPlan?: string | null; isAdmin?: boolean } | null | undefined,
  hasSuccessfulPayment: boolean,
) => {
  if (!user || user.isAdmin) return false;
  if (String(user.membershipPlan || '').toUpperCase() !== 'STAR') return false;
  return !hasSuccessfulPayment;
};

/**
 * The free-launch boot hook set every user to lifetime Star. Paid UPI is back,
 * so drop unpaid Star once. Confirmed payments and admin accounts stay.
 */
export const revokeUnpaidFreeLaunchGrant = async () => {
  const already = await prisma.appSetting.findUnique({
    where: { key: FREE_LAUNCH_REVOKE_KEY },
  }).catch(() => null);
  if (already) return { skipped: true as const, revoked: 0 };

  const paid = await prisma.payment.findMany({
    where: { status: 'SUCCESS' },
    select: { userId: true },
  });
  const paidIds = [...new Set(paid.map((row) => row.userId))];
  const where: { membershipPlan: 'STAR'; isAdmin: false; id?: { notIn: string[] } } = {
    membershipPlan: 'STAR',
    isAdmin: false,
  };
  if (paidIds.length) where.id = { notIn: paidIds };

  const result = await prisma.user.updateMany({
    where,
    data: { membershipPlan: 'BASIC', membershipExpiry: null },
  });

  const value = { revokedAt: new Date().toISOString(), revoked: result.count };
  await prisma.appSetting.upsert({
    where: { key: FREE_LAUNCH_REVOKE_KEY },
    update: { value },
    create: { key: FREE_LAUNCH_REVOKE_KEY, value },
  });

  return { skipped: false as const, revoked: result.count };
};

export const isPaidPlan = (plan?: string | null, expiry?: Date | string | null) => {
  if (PLATFORM_ACCESS_FREE) return true;
  const name = String(plan || '').toUpperCase();
  if (name === 'STAR') return true;
  if (!name || name === 'FREE') return false;
  if (!expiry) return false;
  const when = expiry instanceof Date ? expiry : new Date(expiry);
  return !Number.isNaN(when.getTime()) && when.getTime() > Date.now();
};

const PLAN_NAMES: MembershipTier[] = ['BASIC', 'STANDARD', 'PREMIUM', 'STAR'];

const DEFAULT_PLANS = [
  {
    name: 'BASIC' as const,
    displayName: 'Basic',
    tagline: 'Get started and explore',
    price: 249,
    originalPrice: 498,
    discount: 50,
    durationMonths: 3,
    postLimit: 5,
    isPopular: false,
    isOneTime: false,
    sortOrder: 1,
    features: ['Browse buddy discovery feed', 'View buddy profiles (name, avatar, city, services)', 'Post up to 5 plan requests / month', 'Standard position in discover feed'],
  },
  {
    name: 'STANDARD' as const,
    displayName: 'Standard',
    tagline: 'Great value to get started',
    price: 349,
    originalPrice: 998,
    discount: 65,
    durationMonths: 6,
    postLimit: 10,
    isPopular: false,
    isOneTime: false,
    sortOrder: 2,
    features: ['Everything in Basic', 'Post up to 10 plan requests / month', 'View user social profile links', 'Priority placement in discover', '"Standard" badge on your profile'],
  },
  {
    name: 'PREMIUM' as const,
    displayName: 'Premium',
    tagline: 'For power users',
    price: 449,
    originalPrice: 1600,
    discount: 72,
    durationMonths: 12,
    postLimit: 15,
    isPopular: true,
    isOneTime: false,
    sortOrder: 3,
    features: ['Everything in Standard', 'Post up to 15 plan requests / month', 'Higher priority in discover (above Standard)', '"Premium" badge on your profile'],
  },
  {
    name: 'STAR' as const,
    displayName: 'Star Member',
    tagline: 'Top tier. Pay once, keep forever.',
    price: 649,
    originalPrice: 2040,
    discount: 76,
    durationMonths: 0,
    postLimit: -1,
    isPopular: false,
    isOneTime: true,
    sortOrder: 4,
    features: ['Everything in Premium', 'Unlimited plan requests', 'Pinned to top of discover', 'Star badge on profile card', 'Featured in "Top Buddies" section', 'Lifetime access — pay once'],
  },
];

const isObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

export const ensureDefaultPlans = async () => {
  for (const plan of DEFAULT_PLANS) {
    await prisma.membershipPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }
};

export const findPlan = async (planId: string) => {
  const raw = String(planId || '').trim();
  if (!raw) throw new Error('Plan not found');

  if (isObjectId(raw)) {
    const byId = await prisma.membershipPlan.findUnique({ where: { id: raw } });
    if (byId) return byId;
  }

  const name = raw.toUpperCase() as MembershipTier;
  if (PLAN_NAMES.includes(name)) {
    await ensureDefaultPlans();
    const byName = await prisma.membershipPlan.findUnique({ where: { name } });
    if (byName) return byName;
  }

  throw new Error('Plan not found');
};

export const getPlans = async () => {
  const existing = await prisma.membershipPlan.findMany({
    orderBy: { sortOrder: 'asc' }
  });
  if (existing.length > 0) return existing;
  await ensureDefaultPlans();
  return prisma.membershipPlan.findMany({
    orderBy: { sortOrder: 'asc' }
  });
};

export const getUserPlan = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { membershipPlan: true, membershipExpiry: true }
  });
  if (!user) return null;

  const plan = await prisma.membershipPlan.findUnique({
    where: { name: user.membershipPlan as any }
  });

  return {
    membershipPlan: user.membershipPlan,
    membershipExpiry: user.membershipExpiry,
    plan
  };
};

export const activatePlan = async (userId: string, planId: string) => {
  const plan = await findPlan(planId);

  const expiry = new Date();
  if (plan.durationMonths > 0) {
    expiry.setMonth(expiry.getMonth() + plan.durationMonths);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      membershipPlan: plan.name as any,
      membershipExpiry: plan.durationMonths > 0 ? expiry : null
    }
  });
};

export const checkPlanExpiry = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { membershipPlan: true, membershipExpiry: true }
  });
  if (!user) return;
  
  if (user.membershipPlan === 'STAR') return;
  if (user.membershipExpiry && user.membershipExpiry < new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { membershipPlan: 'BASIC' as any, membershipExpiry: null }
    });
  }
};
