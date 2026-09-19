import { prisma } from '../config/db.js';
export const getPlans = async () => {
    return prisma.membershipPlan.findMany({
        orderBy: { sortOrder: 'asc' }
    });
};
export const getUserPlan = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { membershipPlan: true, membershipExpiry: true }
    });
    if (!user)
        return null;
    const plan = await prisma.membershipPlan.findUnique({
        where: { name: user.membershipPlan }
    });
    return {
        membershipPlan: user.membershipPlan,
        membershipExpiry: user.membershipExpiry,
        plan
    };
};
export const activatePlan = async (userId, planId) => {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan)
        throw new Error('Plan not found');
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + plan.durationMonths);
    return prisma.user.update({
        where: { id: userId },
        data: {
            membershipPlan: plan.name,
            membershipExpiry: expiry
        }
    });
};
export const checkPlanExpiry = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { membershipPlan: true, membershipExpiry: true }
    });
    if (!user)
        return;
    if (user.membershipExpiry && user.membershipExpiry < new Date() && user.membershipPlan !== 'BASIC') {
        await prisma.user.update({
            where: { id: userId },
            data: { membershipPlan: 'BASIC', membershipExpiry: null }
        });
    }
};
