import { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { prisma } from '../config/db.js';

const router = Router();

// Shared projection: everything the admin UI needs, never the password hash.
const adminUserSelect = {
  id: true, name: true, email: true, phone: true, role: true, city: true, state: true,
  avatar: true, bio: true, verified: true, banned: true, isAdmin: true, aadhaarUrl: true,
  membershipPlan: true, membershipExpiry: true, isOnline: true, lastSeen: true,
  profileCompletion: true, availableForRequests: true, createdAt: true
};

const asInt = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

/* ------------------------------------------------------------------ stats */
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers, verifiedUsers, bannedUsers, pendingVerifications, newToday, onlineNow,
      clients, buddies, both,
      totalRequests, openRequests, totalOffers, totalChats, totalMessages, totalReviews,
      revenueAll, revenueMonth, successfulPayments, pendingPayments, recentSignups
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { verified: true } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.user.count({ where: { aadhaarUrl: { not: null }, verified: false } }),
      prisma.user.count({ where: { createdAt: { gte: dayStart } } }),
      prisma.user.count({ where: { isOnline: true } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'BUDDY' } }),
      prisma.user.count({ where: { role: 'BOTH' } }),
      prisma.request.count(),
      prisma.request.count({ where: { status: 'OPEN' } }),
      prisma.requestOffer.count(),
      prisma.chat.count(),
      prisma.message.count(),
      prisma.review.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS', createdAt: { gte: monthStart } } }),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({ take: 8, orderBy: { createdAt: 'desc' }, select: adminUserSelect })
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, verified: verifiedUsers, banned: bannedUsers, pendingVerifications, newToday, onlineNow },
        roles: { clients, buddies, both },
        activity: { totalRequests, openRequests, totalOffers, totalChats, totalMessages, totalReviews },
        revenue: {
          total: revenueAll._sum.amount || 0,
          thisMonth: revenueMonth._sum.amount || 0,
          successfulPayments,
          pendingPayments
        },
        recentSignups
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ------------------------------------------------------------------ users */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = asInt(req.query.page, 1);
    const limit = Math.min(asInt(req.query.limit, 20), 100);
    const { search, role, verified, banned, plan } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (plan) where.membershipPlan = plan;
    if (verified === 'true' || verified === 'false') where.verified = verified === 'true';
    if (banned === 'true' || banned === 'false') where.banned = banned === 'true';

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: adminUserSelect
      }),
      prisma.user.count({ where })
    ]);

    res.json({ success: true, data: { data, total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...adminUserSelect,
        interests: { include: { interest: true } },
        requests: { take: 10, orderBy: { createdAt: 'desc' } },
        payments: { take: 10, orderBy: { createdAt: 'desc' }, include: { plan: true } },
        receivedReviews: { take: 10, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    const data = await prisma.user.update({
      where: { id: req.params.id },
      data: { verified: req.body.verified !== false },
      select: adminUserSelect
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Banning is now a dedicated field instead of overloading `verified`.
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ success: false, message: 'You cannot ban your own account' });
    }
    const data = await prisma.user.update({
      where: { id: req.params.id },
      data: { banned: req.body.banned !== false },
      select: adminUserSelect
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['CLIENT', 'BUDDY', 'BOTH'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const data = await prisma.user.update({ where: { id: req.params.id }, data: { role }, select: adminUserSelect });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ---------------------------------------------------------- verifications */
router.get('/verifications', adminAuth, async (req, res) => {
  try {
    const page = asInt(req.query.page, 1);
    const limit = Math.min(asInt(req.query.limit, 20), 100);
    const where = { aadhaarUrl: { not: null }, verified: false };

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'asc' }, select: adminUserSelect }),
      prisma.user.count({ where })
    ]);
    res.json({ success: true, data: { data, total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* --------------------------------------------------------------- requests */
router.get('/requests', adminAuth, async (req, res) => {
  try {
    const page = asInt(req.query.page, 1);
    const limit = Math.min(asInt(req.query.limit, 20), 100);
    const { status, category, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true, phone: true } },
          _count: { select: { offers: true } }
        }
      }),
      prisma.request.count({ where })
    ]);
    res.json({ success: true, data: { data, total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/requests/:id', adminAuth, async (req, res) => {
  try {
    await prisma.request.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Request deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* --------------------------------------------------------------- payments */
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const page = asInt(req.query.page, 1);
    const limit = Math.min(asInt(req.query.limit, 20), 100);
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total, sum] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          plan: { select: { id: true, name: true, displayName: true, price: true } }
        }
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { ...where, status: 'SUCCESS' } })
    ]);
    res.json({ success: true, data: { data, total, page, limit, pages: Math.ceil(total / limit), revenue: sum._sum.amount || 0 } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ------------------------------------------------------------------ plans */
router.get('/plans', adminAuth, async (req, res) => {
  try {
    const data = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/plans/:id', adminAuth, async (req, res) => {
  try {
    const { displayName, tagline, price, originalPrice, discount, durationMonths, postLimit, features, isPopular, sortOrder } = req.body;
    const patch: any = {};
    if (displayName !== undefined) patch.displayName = String(displayName);
    if (tagline !== undefined) patch.tagline = String(tagline);
    if (price !== undefined) patch.price = Number(price);
    if (originalPrice !== undefined) patch.originalPrice = Number(originalPrice);
    if (discount !== undefined) patch.discount = Number(discount);
    if (durationMonths !== undefined) patch.durationMonths = Number(durationMonths);
    if (postLimit !== undefined) patch.postLimit = Number(postLimit);
    if (features !== undefined) patch.features = features;
    if (isPopular !== undefined) patch.isPopular = Boolean(isPopular);
    if (sortOrder !== undefined) patch.sortOrder = Number(sortOrder);

    const data = await prisma.membershipPlan.update({ where: { id: req.params.id }, data: patch });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ---------------------------------------------------------------- reviews */
router.get('/reviews', adminAuth, async (req, res) => {
  try {
    const page = asInt(req.query.page, 1);
    const limit = Math.min(asInt(req.query.limit, 20), 100);
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: { select: { id: true, name: true, avatar: true } },
          reviewee: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.review.count()
    ]);
    res.json({ success: true, data: { data, total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/reviews/:id', adminAuth, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
