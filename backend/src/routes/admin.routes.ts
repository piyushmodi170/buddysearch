import { Router } from 'express';
import { adminAuth } from '../middleware/auth.js';
import { prisma } from '../config/db.js';
import { publicSafeError } from '../config/db-errors.js';
import { repairBrokenUsers } from '../config/mongo.js';
import { getSetting, setSetting, maskSettings, settingStatus } from '../config/settings.js';
import { sendTestEmail } from '../services/mail.service.js';
import adminEmailRoutes from './admin-email.routes.js';
import adminSeoArticleRoutes from './admin-seo-articles.routes.js';
import * as paymentService from '../services/payment.service.js';
import { isOwnerEmail } from '../config/owner.js';
import { findPlan, restoreCatalogPrices, setupAdminTestPlan } from '../services/membership.service.js';

const router = Router();

// Shared projection: everything the admin UI needs, never the password hash.
const adminUserSelect = {
  id: true, name: true, email: true, phone: true, role: true,
  city: true, state: true, pincode: true, gender: true, bio: true, avatar: true,
  instagram: true, facebook: true, linkedin: true, twitter: true,
  lat: true, lng: true, googleId: true,
  verified: true, emailVerified: true, banned: true, isAdmin: true, aadhaarUrl: true,
  membershipPlan: true, membershipExpiry: true, isOnline: true, lastSeen: true,
  profileCompletion: true, availableForRequests: true, onboardingCompleted: true,
  createdAt: true, updatedAt: true,
};

const asInt = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const withRepairedUsers = async <T>(run: () => Promise<T>) => {
  try {
    return await run();
  } catch (err) {
    await repairBrokenUsers();
    return run();
  }
};

const adminFail = (res: any, error: unknown, fallback: string, status = 500) =>
  res.status(status).json({ success: false, message: publicSafeError(error, fallback) });

function publicAdminUser<T extends { googleId?: string | null }>(user: T) {
  const { googleId, ...rest } = user;
  return { ...rest, googleLinked: Boolean(googleId) };
}

/* ------------------------------------------------------------------ stats */
router.get('/stats', adminAuth, async (_req, res) => {
  try {
    const data = await withRepairedUsers(async () => {
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

      return {
        users: { total: totalUsers, verified: verifiedUsers, banned: bannedUsers, pendingVerifications, newToday, onlineNow },
        roles: { clients, buddies, both },
        activity: { totalRequests, openRequests, totalOffers, totalChats, totalMessages, totalReviews },
        revenue: {
          total: revenueAll._sum.amount || 0,
          thisMonth: revenueMonth._sum.amount || 0,
          successfulPayments,
          pendingPayments
        },
        recentSignups: recentSignups.map(publicAdminUser)
      };
    });
    res.json({ success: true, data });
  } catch (error: any) {
    adminFail(res, error, 'Could not load dashboard');
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
    if (plan === 'NONE' || plan === 'FREE' || plan === 'unpaid') {
      where.AND = [
        ...(where.AND || []),
        { membershipPlan: { not: 'STAR' } },
        {
          OR: [
            { membershipExpiry: null },
            { membershipExpiry: { lte: new Date() } },
          ],
        },
      ];
    } else if (plan) {
      where.membershipPlan = plan;
      if (plan !== 'STAR') {
        where.membershipExpiry = { gt: new Date() };
      }
    }
    if (verified === 'true' || verified === 'false') where.verified = verified === 'true';
    if (banned === 'true' || banned === 'false') where.banned = banned === 'true';

    const [rows, total] = await withRepairedUsers(() => Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: adminUserSelect
      }),
      prisma.user.count({ where })
    ]));

    res.json({
      success: true,
      data: { data: rows.map(publicAdminUser), total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    adminFail(res, error, 'Could not load users');
  }
});

router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...adminUserSelect,
        interests: { include: { interest: true } },
        requests: { take: 100, orderBy: { createdAt: 'desc' } },
        sentOffers: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { request: { select: { id: true, title: true, category: true } } },
        },
        payments: {
          take: 100,
          orderBy: { createdAt: 'desc' },
          include: { plan: { select: { name: true, displayName: true } } },
        },
        receivedReviews: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
        givenReviews: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { reviewee: { select: { id: true, name: true } } },
        },
        _count: {
          select: {
            chats1: true,
            chats2: true,
            sentMessages: true,
            notifications: true,
            requests: true,
            payments: true,
          },
        },
      }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { googleId, interests, _count, ...rest } = user;
    res.json({
      success: true,
      data: {
        ...rest,
        googleLinked: Boolean(googleId),
        interests: interests.map((row) => row.interest),
        chatCount: (_count.chats1 || 0) + (_count.chats2 || 0),
        messageCount: _count.sentMessages || 0,
        notificationCount: _count.notifications || 0,
        requestCount: _count.requests || 0,
        paymentCount: _count.payments || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    const data = await prisma.user.update({
      where: { id: req.params.id },
      data: { verified: req.body.verified !== false },
      select: adminUserSelect
    });
    res.json({ success: true, data: publicAdminUser(data) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
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
    res.json({ success: true, data: publicAdminUser(data) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['CLIENT', 'BUDDY', 'BOTH'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const data = await prisma.user.update({ where: { id: req.params.id }, data: { role }, select: adminUserSelect });
    res.json({ success: true, data: publicAdminUser(data) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
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
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

/* ---------------------------------------------------------- verifications */
router.get('/verifications', adminAuth, async (req, res) => {
  try {
    const page = asInt(req.query.page, 1);
    const limit = Math.min(asInt(req.query.limit, 20), 100);
    const where = { aadhaarUrl: { not: null }, verified: false };

    const [rows, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'asc' }, select: adminUserSelect }),
      prisma.user.count({ where })
    ]);
    res.json({ success: true, data: { data: rows.map(publicAdminUser), total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
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
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.delete('/requests/:id', adminAuth, async (req, res) => {
  try {
    await prisma.request.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Request deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
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
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.post('/payments/:id/confirm', adminAuth, async (req, res) => {
  try {
    const data = await paymentService.confirmUpiPayment(req.params.id);
    res.json({ success: true, data, message: 'Transfer confirmed. Membership is active.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/payments/:id/reject', adminAuth, async (req, res) => {
  try {
    const data = await paymentService.rejectUpiPayment(req.params.id);
    res.json({ success: true, data, message: 'Payment marked failed.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ------------------------------------------------------------------ plans */
router.get('/plans', adminAuth, async (req, res) => {
  try {
    const data = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.post('/plans/setup-test', adminAuth, async (req, res) => {
  try {
    const mode = String(req.body?.mode || 'free') === 'rupee' ? 'rupee' : 'free';
    const data = await setupAdminTestPlan(mode);
    res.json({
      success: true,
      data,
      message: mode === 'rupee'
        ? 'BASIC is ₹1. Open Membership, pay with UPI, paste UTR, then Confirm on Payments.'
        : 'BASIC is ₹0. Open Membership and tap Activate free (test).',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || publicSafeError(error, 'Something went wrong') });
  }
});

router.post('/plans/restore-catalog', adminAuth, async (req, res) => {
  try {
    const data = await restoreCatalogPrices();
    res.json({ success: true, data, message: 'Catalog prices restored (₹249 / ₹349 / ₹449 / ₹649).' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || publicSafeError(error, 'Something went wrong') });
  }
});

router.put('/plans/:id', adminAuth, async (req, res) => {
  try {
    const { displayName, tagline, price, originalPrice, discount, durationMonths, postLimit, features, isPopular, isOneTime, sortOrder } = req.body;
    const patch: any = {};
    if (displayName !== undefined) patch.displayName = String(displayName);
    if (tagline !== undefined) patch.tagline = String(tagline);
    if (price !== undefined) patch.price = Number(price);
    if (originalPrice !== undefined) patch.originalPrice = Number(originalPrice);
    if (discount !== undefined) patch.discount = Number(discount);
    if (durationMonths !== undefined) patch.durationMonths = Number(durationMonths);
    if (postLimit !== undefined) patch.postLimit = Number(postLimit);
    if (features !== undefined) {
      patch.features = Array.isArray(features)
        ? features
        : String(features).split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    if (isPopular !== undefined) patch.isPopular = Boolean(isPopular);
    if (isOneTime !== undefined) patch.isOneTime = Boolean(isOneTime);
    if (sortOrder !== undefined) patch.sortOrder = Number(sortOrder);

    const data = await prisma.membershipPlan.update({ where: { id: req.params.id }, data: patch });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
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
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.delete('/reviews/:id', adminAuth, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

/* --------------------------------------------------------------- settings */

router.get('/settings/status', adminAuth, async (_req, res) => {
  try {
    const data = await settingStatus();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.get('/settings/:key', adminAuth, async (req, res) => {
  try {
    const key = req.params.key as 'razorpay' | 'smtp' | 'google' | 'app' | 'upi';
    if (!['razorpay', 'smtp', 'google', 'app', 'upi'].includes(key)) {
      return res.status(400).json({ success: false, message: 'Unknown settings group' });
    }
    const value = await getSetting(key);
    res.json({ success: true, data: maskSettings(key, value) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.put('/settings/:key', adminAuth, async (req, res) => {
  try {
    const key = req.params.key as 'razorpay' | 'smtp' | 'google' | 'app' | 'upi';
    if (!['razorpay', 'smtp', 'google', 'app', 'upi'].includes(key)) {
      return res.status(400).json({ success: false, message: 'Unknown settings group' });
    }
    const value = await setSetting(key, req.body || {});
    res.json({ success: true, data: maskSettings(key, value) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.post('/settings/razorpay/test', adminAuth, async (_req, res) => {
  try {
    const data = await paymentService.testRazorpayCredentials();
    res.json({
      success: true,
      data,
      message: `Live Razorpay keys work. Created order ${data.orderId}. Webhook secret is optional.`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, error?.message || 'Razorpay test failed') });
  }
});

router.post('/settings/smtp/test', adminAuth, async (req, res) => {
  try {
    const to = req.body?.to || req.user?.email;
    const data = await sendTestEmail(to);
    res.json({ success: true, data, message: `Test email sent to ${data.to}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, membershipPlan, banned, verified, role, city } = req.body || {};
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (email !== undefined) {
      const nextEmail = String(email).trim().toLowerCase();
      if (!nextEmail.includes('@')) {
        return res.status(400).json({ success: false, message: 'Enter a valid email' });
      }
      patch.email = nextEmail;
      patch.isAdmin = isOwnerEmail(nextEmail);
    }
    if (city !== undefined) patch.city = String(city);
    if (banned !== undefined) patch.banned = Boolean(banned);
    if (verified !== undefined) patch.verified = Boolean(verified);
    if (role !== undefined) {
      if (!['CLIENT', 'BUDDY', 'BOTH'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      patch.role = role;
    }
    if (membershipPlan !== undefined) {
      const next = String(membershipPlan).toUpperCase();
      if (next === 'NONE' || next === 'FREE' || next === '') {
        patch.membershipPlan = 'BASIC';
        patch.membershipExpiry = null;
      } else if (['BASIC', 'STANDARD', 'PREMIUM', 'STAR'].includes(next)) {
        const catalog = await findPlan(next).catch(() => null);
        patch.membershipPlan = next;
        if (next === 'STAR' || !catalog || catalog.durationMonths <= 0) {
          patch.membershipExpiry = null;
        } else {
          const expiry = new Date();
          expiry.setMonth(expiry.getMonth() + catalog.durationMonths);
          patch.membershipExpiry = expiry;
        }
      } else {
        return res.status(400).json({ success: false, message: 'Invalid membership plan' });
      }
    }

    const data = await prisma.user.update({
      where: { id: req.params.id },
      data: patch,
      select: adminUserSelect
    });
    res.json({ success: true, data: publicAdminUser(data) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.post('/plans', adminAuth, async (req, res) => {
  try {
    const {
      name, displayName, tagline, price, originalPrice, discount,
      durationMonths, postLimit, features, isPopular, isOneTime, sortOrder
    } = req.body || {};
    if (!['BASIC', 'STANDARD', 'PREMIUM', 'STAR'].includes(name)) {
      return res.status(400).json({ success: false, message: 'Plan name must be BASIC, STANDARD, PREMIUM, or STAR' });
    }
    const data = await prisma.membershipPlan.create({
      data: {
        name,
        displayName: displayName || name,
        tagline: tagline || '',
        price: Number(price) || 0,
        originalPrice: Number(originalPrice) || Number(price) || 0,
        discount: Number(discount) || 0,
        durationMonths: Number(durationMonths) || 1,
        postLimit: Number(postLimit) || 0,
        features: Array.isArray(features)
          ? features
          : String(features || '').split('\n').map((s: string) => s.trim()).filter(Boolean),
        isPopular: Boolean(isPopular),
        isOneTime: Boolean(isOneTime),
        sortOrder: Number(sortOrder) || 99,
      }
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: publicSafeError(error, 'Something went wrong') });
  }
});

router.use(adminEmailRoutes);
router.use(adminSeoArticleRoutes);

export default router;
