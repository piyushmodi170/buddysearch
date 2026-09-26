import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';
import { isCanonicalOwnerEmail } from '../config/owner.js';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
  } catch (error) {
    // Ignore error for optional auth
  }
  next();
};

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  auth(req, res, () => {
    void (async () => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { email: true },
        });
        // JWT email is not enough: a member can store a case-variant of the
        // owner address (Mongo unique is case-sensitive) and the JWT claim
        // would then pass a case-insensitive check.
        if (!isCanonicalOwnerEmail(user?.email)) {
          return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        next();
      } catch {
        res.status(403).json({ success: false, message: 'Admin access required' });
      }
    })();
  });
};
