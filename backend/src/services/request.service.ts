import { prisma } from '../config/db.js';

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    )
  ]);
};

export const getPostLimit = (plan: string) => {
  if (plan === 'STAR') return -1; // Unlimited
  if (plan === 'PREMIUM') return 15;
  if (plan === 'STANDARD') return 10;
  return 5; // BASIC
};

export const getMonthlyPostCount = async (userId: string) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  try {
    return await withTimeout(
      prisma.request.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth }
        }
      })
    );
  } catch {
    return 0;
  }
};

export const createRequestService = async (userId: string, data: any) => {
  try {
    const user = await withTimeout(prisma.user.findUnique({ where: { id: userId } }));
    const plan = user?.membershipPlan || 'BASIC';
    const limit = getPostLimit(plan);
    const count = await getMonthlyPostCount(userId);

    if (limit !== -1 && count >= limit) {
      throw new Error(`Monthly request limit reached for ${plan} tier.`);
    }

    return await withTimeout(
      prisma.request.create({
        data: { ...data, userId }
      })
    );
  } catch (err: any) {
    if (err.message.includes('limit reached')) throw err;
    throw err;
  }
};

export const getMyRequestsService = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [data, total] = await withTimeout(
    Promise.all([
      prisma.request.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { offers: true }
      }),
      prisma.request.count({ where: { userId } })
    ]),
    8000
  );
  return { data, total, page, limit };
};

export const getMarketplaceRequestsService = async (filters: any, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    let where: any = { status: 'OPEN' };
    
    if (filters.category) where.category = filters.category;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await withTimeout(
      Promise.all([
        prisma.request.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatar: true } } }
        }),
        prisma.request.count({ where })
      ])
    );
    return { data, total, page, limit };
  } catch (err) {
    return { data: [], total: 0, page, limit };
  }
};

const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export const getRequestService = async (id: string) => {
  if (!isObjectId(id)) {
    throw new Error('Request not found');
  }
  const req = await withTimeout(
    prisma.request.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true, profileCompletion: true } },
        offers: { include: { buddy: { select: { id: true, name: true, avatar: true } } } }
      }
    }),
    8000
  );
  if (!req) throw new Error('Request not found');
  return req;
};

export const updateRequestService = async (userId: string, requestId: string, data: any) => {
  if (!isObjectId(requestId)) {
    throw new Error('Request not found');
  }
  const req = await withTimeout(prisma.request.findUnique({ where: { id: requestId } }), 8000);
  if (!req || req.userId !== userId) throw new Error('Unauthorized or not found');
  return withTimeout(prisma.request.update({ where: { id: requestId }, data }), 8000);
};

export const deleteRequestService = async (userId: string, requestId: string) => {
  if (!isObjectId(requestId)) {
    throw new Error('Request not found');
  }
  const req = await withTimeout(prisma.request.findUnique({ where: { id: requestId } }), 8000);
  if (!req || req.userId !== userId) throw new Error('Unauthorized or not found');
  return withTimeout(prisma.request.delete({ where: { id: requestId } }), 8000);
};

export const createOfferService = async (requestId: string, buddyId: string, message?: string) => {
  if (!isObjectId(requestId)) {
    throw new Error('Request not found');
  }
  const req = await withTimeout(prisma.request.findUnique({ where: { id: requestId } }), 8000);
  if (!req || req.status !== 'OPEN') throw new Error('Request is not open for offers');

  return withTimeout(
    prisma.requestOffer.create({
      data: {
        requestId,
        buddyId,
        message,
        status: 'PENDING'
      }
    }),
    8000
  );
};


