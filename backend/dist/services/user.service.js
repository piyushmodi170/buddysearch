import { prisma } from '../config/db.js';
import { uploadFile } from '../config/s3.js';
export const calculateProfileCompletion = (user, interestsCount) => {
    let score = 0;
    if (user.name)
        score += 10;
    if (user.bio)
        score += 15;
    if (user.city)
        score += 15;
    if (user.avatar)
        score += 20;
    if (interestsCount > 0)
        score += 15;
    if (user.aadhaarUrl)
        score += 25;
    return score;
};
export const getProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            interests: { include: { interest: true } },
            receivedReviews: true
        }
    });
    if (!user)
        throw new Error('User not found');
    const avgRating = user.receivedReviews.length
        ? user.receivedReviews.reduce((sum, r) => sum + r.rating, 0) / user.receivedReviews.length
        : 0;
    return { ...user, avgRating, reviewCount: user.receivedReviews.length };
};
export const updateProfile = async (userId, data) => {
    const current = await prisma.user.findUnique({ where: { id: userId }, include: { interests: true } });
    if (!current)
        throw new Error('User not found');
    const updated = await prisma.user.update({
        where: { id: userId },
        data: { ...data }
    });
    const completion = calculateProfileCompletion(updated, current.interests.length);
    return prisma.user.update({ where: { id: userId }, data: { profileCompletion: completion } });
};
export const uploadAvatarService = async (userId, file) => {
    const url = await uploadFile(file.buffer, `avatars/${userId}-${Date.now()}.jpg`, file.mimetype);
    return updateProfile(userId, { avatar: url });
};
export const uploadAadhaarService = async (userId, file) => {
    const url = await uploadFile(file.buffer, `aadhaar/${userId}-${Date.now()}.${file.originalname.split('.').pop()}`, file.mimetype);
    return updateProfile(userId, { aadhaarUrl: url, aadhaarVerified: false });
};
export const updateInterestsService = async (userId, interestIds) => {
    await prisma.userInterest.deleteMany({ where: { userId } });
    const creates = interestIds.map(id => ({ userId, interestId: id }));
    await prisma.userInterest.createMany({ data: creates });
    const current = await prisma.user.findUnique({ where: { id: userId } });
    if (current) {
        const completion = calculateProfileCompletion(current, interestIds.length);
        await prisma.user.update({ where: { id: userId }, data: { profileCompletion: completion } });
    }
};
