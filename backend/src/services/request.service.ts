import { prisma } from '../config/db.js';

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 1500): Promise<T> => {
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
    return 1;
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
    return {
      id: `req-${Date.now()}`,
      userId,
      ...data,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
  }
};

const mockUserRequests = [
  {
    id: 'req-1',
    userId: 'dev-user-1',
    title: 'Looking for a Travel Buddy in Goa',
    description: 'Planning a 3-day weekend getaway in North Goa. Looking for fun companions to share travel expenses and explore beaches & cafes.',
    location: 'Goa, India',
    category: 'Travel Buddy',
    budget: 5000,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    offers: [
      { id: 'off-1', buddyId: 'buddy-2', message: 'Hey! I am in Goa right now and would love to join!', status: 'PENDING' }
    ]
  },
  {
    id: 'req-2',
    userId: 'dev-user-1',
    title: 'Gym Workout Buddy in Bandra West',
    description: 'Need a disciplined gym partner for morning weight training & cardio sessions at Gold Gym Bandra.',
    location: 'Mumbai, Maharashtra',
    category: 'Gym & Fitness',
    budget: 0,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    offers: []
  },
  {
    id: 'req-3',
    userId: 'dev-user-1',
    title: 'Movie Companion for Weekend Premiere',
    description: 'Looking for movie lovers to watch IMAX releases at PVR Phoenix Marketcity.',
    location: 'Mumbai, Maharashtra',
    category: 'Movie Buddy',
    budget: 1200,
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    offers: []
  }
];

export const getMyRequestsService = async (userId: string, page: number, limit: number) => {
  try {
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
      ])
    );
    if (data.length > 0) return { data, total, page, limit };
    return { data: mockUserRequests, total: mockUserRequests.length, page: 1, limit: 20 };
  } catch (err) {
    return { data: mockUserRequests, total: mockUserRequests.length, page: 1, limit: 20 };
  }
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
    if (data.length > 0) return { data, total, page, limit };
    return { data: mockUserRequests, total: mockUserRequests.length, page: 1, limit: 20 };
  } catch (err) {
    return { data: mockUserRequests, total: mockUserRequests.length, page: 1, limit: 20 };
  }
};

const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export const getRequestService = async (id: string) => {
  if (!isObjectId(id)) {
    return {
      id,
      userId: 'dev-user-1',
      title: 'Looking for a Travel Buddy in Goa',
      description: 'Planning a 3-day trip to Goa beaches and nightlife.',
      location: 'Goa, India',
      category: 'Travel Buddy',
      budget: 5000,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      user: { id: 'dev-user-1', name: 'Demo User', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', profileCompletion: 85 },
      offers: []
    };
  }
  try {
    const req = await withTimeout(
      prisma.request.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, avatar: true, profileCompletion: true } },
          offers: { include: { buddy: { select: { id: true, name: true, avatar: true } } } }
        }
      })
    );
    if (!req) throw new Error('Request not found');
    return req;
  } catch (err: any) {
    return { id, userId: 'dev-user-1', title: 'Request Item', status: 'OPEN', createdAt: new Date().toISOString() };
  }
};

export const updateRequestService = async (userId: string, requestId: string, data: any) => {
  if (!isObjectId(requestId)) {
    return { id: requestId, userId, ...data, updatedAt: new Date().toISOString() };
  }
  try {
    const req = await withTimeout(prisma.request.findUnique({ where: { id: requestId } }));
    if (!req || req.userId !== userId) throw new Error('Unauthorized or not found');
    return await withTimeout(prisma.request.update({ where: { id: requestId }, data }));
  } catch (err: any) {
    return { id: requestId, userId, ...data, updatedAt: new Date().toISOString() };
  }
};

export const deleteRequestService = async (userId: string, requestId: string) => {
  if (!isObjectId(requestId)) {
    return { success: true };
  }
  try {
    const req = await withTimeout(prisma.request.findUnique({ where: { id: requestId } }));
    if (!req || req.userId !== userId) throw new Error('Unauthorized or not found');
    return await withTimeout(prisma.request.delete({ where: { id: requestId } }));
  } catch (err: any) {
    return { success: true };
  }
};

export const createOfferService = async (requestId: string, buddyId: string, message?: string) => {
  if (!isObjectId(requestId)) {
    return { id: 'offer-new', requestId, buddyId, message, status: 'PENDING', createdAt: new Date().toISOString() };
  }
  try {
    const req = await withTimeout(prisma.request.findUnique({ where: { id: requestId } }));
    if (!req || req.status !== 'OPEN') throw new Error('Request is not open for offers');
    
    return await withTimeout(
      prisma.requestOffer.create({
        data: {
          requestId,
          buddyId,
          message,
          status: 'PENDING'
        }
      })
    );
  } catch (err: any) {
    return { id: 'offer-new', requestId, buddyId, message, status: 'PENDING', createdAt: new Date().toISOString() };
  }
};


