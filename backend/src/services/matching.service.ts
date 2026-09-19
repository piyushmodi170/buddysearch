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

const matchesDiscoverFilters = (
  buddy: { name?: string | null; city?: string | null; state?: string | null; bio?: string | null; interests?: { interest?: { slug?: string } }[] },
  filters: DiscoverFilters
) => {
  if (filters.city) {
    const city = filters.city.toLowerCase();
    const hit =
      (buddy.city || '').toLowerCase() === city ||
      (buddy.state || '').toLowerCase().includes(city);
    if (!hit) return false;
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const blob = `${buddy.name || ''} ${buddy.city || ''} ${buddy.state || ''} ${buddy.bio || ''}`.toLowerCase();
    if (!blob.includes(q)) return false;
  }
  if (filters.interestSlugs && filters.interestSlugs.length > 0) {
    const have = (buddy.interests || []).map((row) => row.interest?.slug).filter(Boolean) as string[];
    if (!filters.interestSlugs.some((slug) => have.includes(slug))) return false;
  }
  return true;
};

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
  const poolSize = Math.min(80, Math.max(limit * 4, 40));

  // Build base where clause
  const where: any = {
    id: { not: userId },
    banned: false,
  };

  if (filters.city) {
    // MongoDB does not support Prisma `mode: 'insensitive'` — filter in memory below.
  }
  if (filters.search) {
    // Applied in memory after fetch so Atlas is not asked for unsupported string modes.
  }
  if (filters.interestSlugs && filters.interestSlugs.length > 0) {
    where.interests = {
      some: { interest: { slug: { in: filters.interestSlugs } } },
    };
  }

  // Get current user for scoring context
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lat: true,
      lng: true,
      city: true,
      interests: { include: { interest: { select: { slug: true } } } },
    },
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
      take: poolSize,
      select: {
        id: true,
        name: true,
        role: true,
        city: true,
        state: true,
        avatar: true,
        bio: true,
        lat: true,
        lng: true,
        isOnline: true,
        lastSeen: true,
        membershipPlan: true,
        profileCompletion: true,
        verified: true,
        availableForRequests: true,
        createdAt: true,
        interests: { include: { interest: { select: { slug: true, label: true } } } },
      },
    });

    const filteredPool = pool.filter((buddy) => matchesDiscoverFilters(buddy, filters));

    const currentInterestSlugs = new Set(
      currentUser?.interests.map((i) => i.interest.slug) || []
    );

    // Score each buddy
    const scored = filteredPool.map((buddy) => {
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
      const ratingBonus = 0.6;

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

      return { ...buddy, _score: score, _distance: distanceScore };
    });

    scored.sort((a, b) => b._score - a._score);

    const total = scored.length;
    const paginated = scored.slice(skip, skip + limit).map(({ _score, _distance, ...rest }) => rest);

    const result = { data: paginated, total, page, limit };
    await setCache(cacheKey, JSON.stringify(result), 60);
    return result;
  }

  // Standard DB-sorted query for 'new' and 'trending' tabs
  const buddies = await prisma.user.findMany({
    where,
    take: poolSize,
    orderBy: orderBy.length > 0 ? orderBy : undefined,
    include: { interests: { include: { interest: true } } },
  });
  const matched = buddies.filter((buddy) => matchesDiscoverFilters(buddy, filters));
  const total = matched.length;
  const pageRows = matched.slice(skip, skip + limit);
  const safeBuddies = pageRows.map((buddy) => {
    const { passwordHash, ...rest } = buddy as typeof buddy & { passwordHash?: string };
    return rest;
  });
  const result = { data: safeBuddies, total, page, limit };
  await setCache(cacheKey, JSON.stringify(result), 60);
  return result;
};
