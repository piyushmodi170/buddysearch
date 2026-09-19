import { prisma } from '../config/db.js';

export type MembershipTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'STAR';

export const isPaidPlan = (plan?: string | null, expiry?: Date | string | null) => {
  const name = String(plan || '').toUpperCase();
  if (name === 'STAR') return true;
  if (!name || name === 'FREE') return false;
  if (!expiry) return false;
  const when = expiry instanceof Date ? expiry : new Date(expiry);
  return !Number.isNaN(when.getTime()) && when.getTime() > Date.now();
};

export const getPlans = async () => {
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
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan not found');

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
