import { prisma } from '../config/db.js';
import { evaluateAccount, type ActiveAccountResult } from './active-account.js';

export const loadActiveAccount = async (userId: string): Promise<ActiveAccountResult> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { banned: true },
    });
    return evaluateAccount(user);
  } catch {
    return { ok: false, status: 401, message: 'Invalid or expired token' };
  }
};
