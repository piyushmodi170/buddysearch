import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date, relative = false) {
  const d = new Date(date);
  if (relative) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, 'PPP');
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export function isPaidMembership(user?: {
  membershipPlan?: string | null;
  membershipExpiry?: string | Date | null;
  membership?: string | null;
  isAdmin?: boolean;
} | null) {
  if (!user) return false;
  if (user.isAdmin) return true;
  const plan = (user.membershipPlan || user.membership || '').toUpperCase();
  if (plan === 'STAR') return true;
  if (!plan || plan === 'FREE') return false;
  // New accounts are BASIC with no expiry. Buying any plan (including Basic) sets expiry.
  if (!user.membershipExpiry) return false;
  const when = new Date(user.membershipExpiry);
  return !Number.isNaN(when.getTime()) && when.getTime() > Date.now();
}

/** Razorpay declined this category. Hire, Find, chats, and posts are free. */
export const PLATFORM_ACCESS_FREE = true;

export function hasPlatformAccess(user?: Parameters<typeof isPaidMembership>[0]) {
  if (PLATFORM_ACCESS_FREE) return Boolean(user);
  return isPaidMembership(user);
}

export function planDisplayLabel(user?: {
  membershipPlan?: string | null;
  membershipExpiry?: string | Date | null;
  membership?: string | null;
} | null) {
  if (!isPaidMembership(user)) return 'Free';
  return (user?.membershipPlan || user?.membership || 'Paid').toString();
}

export function purchasedPlanName(user?: {
  membershipPlan?: string | null;
  membershipExpiry?: string | Date | null;
  membership?: string | null;
} | null) {
  if (!isPaidMembership({
    membershipPlan: user?.membershipPlan,
    membershipExpiry: user?.membershipExpiry,
    membership: user?.membership,
  })) return 'None';
  return (user?.membershipPlan || user?.membership || 'Paid').toString();
}

export function needsEmailVerification(user?: {
  email?: string | null;
  emailVerified?: boolean;
  googleId?: string | null;
  isAdmin?: boolean;
} | null) {
  if (!user) return false;
  if (user.isAdmin) return false;
  if (user.googleId) return false;
  return user.emailVerified === false;
}

export function postAuthPath(user?: {
  email?: string | null;
  emailVerified?: boolean;
  googleId?: string | null;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
} | null) {
  if (!user) return '/login';
  if (needsEmailVerification(user)) {
    return `/verify-email?email=${encodeURIComponent(user.email || '')}`;
  }
  if (user.onboardingCompleted === false && !user.isAdmin) return '/onboarding';
  return '/hire';
}

export function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
