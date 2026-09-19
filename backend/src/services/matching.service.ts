import { prisma } from '../config/db.js';
import { getCache, setCache } from '../config/redis.js';

export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MEMBERSHIP_BOOST: Record<string, number> = {
  STAR: 1.0,
  PREMIUM: 0.8,
  STANDARD: 0.4,
  BASIC: 0.0,
};

interface DiscoverFilters {
  search?: string;
  city?: string;
  interestSlugs?: string[];
}

export const discoverBuddies = async (
  userId: string,
  filters: DiscoverFilters,
  tab: string,
  page: number,
  limit: number
) => {
  const cacheKey = `discover:${userId}:${tab}:${JSON.stringify(filters)}:${page}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const skip = (page - 1) * limit;

  // Build base where clause
  const where: any = {
    id: { not: userId },
    banned: false,
  };

  if (filters.city) where.city = { equals: filters.city, mode: 'insensitive' };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { city: { contains: filters.search, mode: 'insensitive' } },
      { bio: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.interestSlugs && filters.interestSlugs.length > 0) {
    where.interests = {
      some: { interest: { slug: { in: filters.interestSlugs } } },
    };
  }

  // Get current user for scoring context
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: { include: { interest: true } } },
  });

  let orderBy: any[] = [];
  const extraWhere: any = {};

  switch (tab) {
    case 'near-you':
      // Will sort in-memory by distance after fetch
      break;

    case 'new':
    case 'new-joiners':
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
      orderBy = [{ createdAt: 'desc' }];
      break;

    case 'trending':
      // Fetch more and sort by review count + request interactions
      orderBy = [{ profileCompletion: 'desc' }, { createdAt: 'desc' }];
      break;

    case 'for-you':
    default:
      // Fetch all, score in-memory, then paginate
      break;
  }

  if (tab === 'for-you' || tab === 'near-you') {
    // Fetch a larger pool to score/sort in-memory
    const pool = await prisma.user.findMany({
      where,
      take: 200,
      include: {
        interests: { include: { interest: true } },
        receivedReviews: { select: { rating: true } },
      },
    });

    const currentInterestSlugs = new Set(
      currentUser?.interests.map((i) => i.interest.slug) || []
    );

    // Score each buddy
    const scored = pool.map((buddy) => {
      const buddyInterestSlugs = buddy.interests.map((i) => i.interest.slug);
      const interestOverlap = currentInterestSlugs.size > 0
        ? buddyInterestSlugs.filter((s) => currentInterestSlugs.has(s)).length / currentInterestSlugs.size
        : 0;

      let distanceScore = 0.5; // default when no location
      if (currentUser?.lat && currentUser?.lng && buddy.lat && buddy.lng) {
        const dist = haversineDistance(currentUser.lat, currentUser.lng, buddy.lat, buddy.lng);
        distanceScore = Math.max(0, 1 - dist / 500); // 0 at 500km+
      } else if (currentUser?.city && buddy.city && currentUser.city.toLowerCase() === buddy.city.toLowerCase()) {
        distanceScore = 0.7;
      }

      const onlineBonus = buddy.isOnline ? 1 : 0;
      const premiumBoost = MEMBERSHIP_BOOST[buddy.membershipPlan] || 0;

      const daysSinceActive = buddy.lastSeen
        ? (Date.now() - buddy.lastSeen.getTime()) / (1000 * 60 * 60 * 24)
        : 30;
      const activityRecency = Math.max(0, 1 - daysSinceActive / 30);

      const avgRating = buddy.receivedReviews.length > 0
        ? buddy.receivedReviews.reduce((sum, r) => sum + r.rating, 0) / buddy.receivedReviews.length
        : 3;
      const ratingBonus = avgRating / 5;

      let score: number;
      if (tab === 'near-you') {
        score = distanceScore; // Pure distance sort
      } else {
        // For You composite score
        score =
          distanceScore * 0.25 +
          interestOverlap * 0.25 +
          onlineBonus * 0.15 +
          premiumBoost * 0.2 +
          activityRecency * 0.1 +
          ratingBonus * 0.05;
      }

      const { receivedReviews, passwordHash, ...buddyData } = buddy as typeof buddy & { passwordHash?: string };
      return { ...buddyData, _score: score, _distance: distanceScore };
    });

    scored.sort((a, b) => b._score - a._score);

    const total = scored.length;
    const paginated = scored.slice(skip, skip + limit).map(({ _score, _distance, ...rest }) => rest);

    const result = { data: paginated, total, page, limit };
    await setCache(cacheKey, JSON.stringify(result), 60);
    return result;
  }

  // Standard DB-sorted query for 'new' and 'trending' tabs
  const [buddies, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      include: { interests: { include: { interest: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  const safeBuddies = buddies.map((buddy) => {
    const { passwordHash, ...rest } = buddy as typeof buddy & { passwordHash?: string };
    return rest;
  });
  const result = { data: safeBuddies, total, page, limit };
  await setCache(cacheKey, JSON.stringify(result), 60);
  return result;
};
