import { prisma } from '../config/db.js';
import { uploadFile } from '../config/s3.js';
import fs from 'fs';
import { publicUser } from './auth.service.js';
import { sanitizeProfilePatch } from './profile-patch.js';

export const calculateProfileCompletion = (user: any, interestsCount: number): number => {
  let score = 0;
  if (user.name) score += 10;
  if (user.bio) score += 15;
  if (user.city) score += 15;
  if (user.avatar) score += 20;
  if (interestsCount > 0) score += 15;
  if (user.aadhaarUrl) score += 25;
  return score;
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interests: { include: { interest: true } },
      receivedReviews: true
    }
  });
  if (!user) throw new Error('User not found');

  const avgRating = user.receivedReviews.length
    ? user.receivedReviews.reduce((sum, r) => sum + r.rating, 0) / user.receivedReviews.length
    : 0;

  return { ...publicUser(user), avgRating, reviewCount: user.receivedReviews.length };
};

export const updateProfile = async (userId: string, data: any) => {
  const current = await prisma.user.findUnique({ where: { id: userId }, include: { interests: true } });
  if (!current) throw new Error('User not found');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: sanitizeProfilePatch(data) as any
  });

  const completion = calculateProfileCompletion(updated, current.interests.length);
  const withScore = await prisma.user.update({ where: { id: userId }, data: { profileCompletion: completion } });
  return publicUser(withScore);
};

export const uploadAvatarService = async (userId: string, file: Express.Multer.File) => {
  const url = await uploadFile(file.buffer, `avatars/${userId}-${Date.now()}.jpg`, file.mimetype);
  return updateProfile(userId, { avatar: url });
};

export const uploadAadhaarService = async (userId: string, file: Express.Multer.File) => {
  const url = await uploadFile(file.buffer, `aadhaar/${userId}-${Date.now()}.${file.originalname.split('.').pop()}`, file.mimetype);
  return updateProfile(userId, { aadhaarUrl: url, aadhaarVerified: false });
};

export const resolveInterestIds = async (idsOrSlugs: string[]) => {
  const catalog = await prisma.interest.findMany();
  const resolved = idsOrSlugs
    .map((value) => catalog.find((item) => item.id === value || item.slug === value || item.label === value)?.id)
    .filter((id): id is string => Boolean(id));
  return Array.from(new Set(resolved));
};

export const listInterests = async () => {
  return prisma.interest.findMany({ orderBy: { label: 'asc' } });
};

export const completeOnboarding = async (userId: string, data: any) => {
  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) throw new Error('User not found');

  const interestIds = await resolveInterestIds(data.interestIds || []);
  const isBuddy = current.role === 'BUDDY' || current.role === 'BOTH';
  if (isBuddy && interestIds.length === 0) {
    throw new Error('Select at least one service you offer');
  }
  if (isBuddy && !(data.bio || '').trim()) {
    throw new Error('Please write a short bio');
  }

  await updateInterestsService(userId, interestIds);

  return updateProfile(userId, {
    gender: data.gender,
    state: data.state,
    city: data.city,
    pincode: data.pincode,
    bio: (data.bio || '').trim() || null,
    instagram: data.instagram || null,
    facebook: data.facebook || null,
    linkedin: data.linkedin || null,
    twitter: data.twitter || null,
    availableForRequests: isBuddy ? Boolean(data.availableForRequests) : false,
    onboardingCompleted: true,
  });
};

export const updateInterestsService = async (userId: string, interestIds: string[]) => {
  const resolved = await resolveInterestIds(interestIds);
  await prisma.userInterest.deleteMany({ where: { userId } });

  const creates = resolved.map((interestId) => ({ userId, interestId }));
  if (creates.length) {
    await prisma.userInterest.createMany({ data: creates });
  }

  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (current) {
    const completion = calculateProfileCompletion(current, resolved.length);
    await prisma.user.update({ where: { id: userId }, data: { profileCompletion: completion } });
  }
};
