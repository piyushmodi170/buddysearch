import { prisma } from '../config/db.js';
import { emitNotification } from '../socket/notification.handler.js';

export type NotificationType = 'MESSAGE' | 'PROFILE_VIEW' | 'REQUEST_RESPONSE' | 'OFFER_RECEIVED' | 'SYSTEM';

export const createNotification = async (io: any, userId: string, type: NotificationType | string, title: string, body: string, metadata?: any) => {
  const notif = await prisma.notification.create({
    data: {
      userId,
      type: type as any,
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

export const getUserNotifications = async (userId: string, page: number, limit: number) => {
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

export const markAsRead = async (id: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true }
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, read: false }
  });
};
