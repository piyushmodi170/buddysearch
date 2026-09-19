import { prisma } from '../config/db.js';
import { emitNotification } from '../socket/notification.handler.js';
export const createNotification = async (io, userId, type, title, body, metadata) => {
    const notif = await prisma.notification.create({
        data: {
            userId,
            type: type,
            title,
            body,
            metadata: metadata || {}
        }
    });
    if (io) {
        emitNotification(io, userId, notif);
    }
    return notif;
};
export const getUserNotifications = async (userId, page, limit) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.notification.count({ where: { userId } })
    ]);
    return { data, total, page, limit };
};
export const markAsRead = async (id, userId) => {
    return prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true }
    });
};
export const markAllAsRead = async (userId) => {
    return prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
    });
};
export const getUnreadCount = async (userId) => {
    return prisma.notification.count({
        where: { userId, read: false }
    });
};
