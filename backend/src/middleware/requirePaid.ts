import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { isOwnerEmail } from '../config/owner.js';
import { isPaidPlan, PLATFORM_ACCESS_FREE } from '../services/membership.service.js';

export const requirePaid = (req: Request, res: Response, next: NextFunction) => {
  if (PLATFORM_ACCESS_FREE) return next();
  void (async () => {
    try {
      if (isOwnerEmail(req.user?.email)) return next();
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { email: true, membershipPlan: true, membershipExpiry: true, isAdmin: true },
      });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      if (isOwnerEmail(user.email) || user.isAdmin || isPaidPlan(user.membershipPlan, user.membershipExpiry)) {
        return next();
      }
      return res.status(402).json({
        success: false,
        code: 'MEMBERSHIP_REQUIRED',
        message: 'A paid membership is required to use BuddySearch.',
      });
    } catch {
      return res.status(402).json({
        success: false,
        code: 'MEMBERSHIP_REQUIRED',
        message: 'A paid membership is required to use BuddySearch.',
      });
    }
  })();
};
