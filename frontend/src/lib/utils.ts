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
} | null) {
  if (!user) return false;
  const plan = (user.membershipPlan || user.membership || 'BASIC').toUpperCase();
  if (plan === 'STAR') return true;
  if (!plan || plan === 'BASIC' || plan === 'FREE') return false;
  if (!user.membershipExpiry) return false;
  const when = new Date(user.membershipExpiry);
  return !Number.isNaN(when.getTime()) && when.getTime() > Date.now();
}

export function planDisplayLabel(user?: {
  membershipPlan?: string | null;
  membershipExpiry?: string | Date | null;
  membership?: string | null;
} | null) {
  if (!isPaidMembership(user)) return 'Free';
  return (user?.membershipPlan || user?.membership || 'Paid').toString();
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
