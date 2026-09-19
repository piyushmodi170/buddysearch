import { prisma } from '../config/db.js';
const userSelect = { id: true, name: true, avatar: true, isOnline: true, lastSeen: true };
export const getOrCreateChat = async (user1Id, user2Id) => {
    const [idA, idB] = [user1Id, user2Id].sort();
    const existing = await prisma.chat.findFirst({
        where: {
            OR: [
                { user1Id: idA, user2Id: idB },
                { user1Id: idB, user2Id: idA }
            ]
        },
        include: {
            user1: { select: userSelect },
            user2: { select: userSelect }
        }
    });
    if (existing)
        return existing;
    return prisma.chat.create({
        data: {
            user1Id: idA,
            user2Id: idB
        },
        include: {
            user1: { select: userSelect },
            user2: { select: userSelect }
        }
    });
};
export const getUserChats = async (userId) => {
    return prisma.chat.findMany({
        where: {
            OR: [{ user1Id: userId }, { user2Id: userId }]
        },
        include: {
            user1: { select: userSelect },
            user2: { select: userSelect },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 }
        },
        orderBy: { lastMessageAt: 'desc' }
    });
};
export const getChatMessages = async (chatId, userId, page, limit) => {
    const chat = await prisma.chat.findUnique({
        where: { id: chatId }
    });
    if (!chat || (chat.user1Id !== userId && chat.user2Id !== userId)) {
        throw new Error('Unauthorized');
    }
    const skip = (page - 1) * limit;
    const messages = await prisma.message.findMany({
        where: { chatId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });
    return messages;
};
export const sendMessageService = async (chatId, senderId, text) => {
    const chat = await prisma.chat.findUnique({
        where: { id: chatId }
    });
    if (!chat || (chat.user1Id !== senderId && chat.user2Id !== senderId))
        throw new Error('Unauthorized');
    const msg = await prisma.message.create({
        data: {
            chatId,
            senderId,
            text,
        }
    });
    await prisma.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: new Date() }
    });
    return msg;
};
export const markAsSeenService = async (chatId, userId) => {
    await prisma.message.updateMany({
        where: { chatId, senderId: { not: userId }, seen: false },
        data: { seen: true }
    });
};
