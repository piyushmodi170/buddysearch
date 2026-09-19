import { getCache } from '../config/redis.js';
export const emitToUser = async (io, userId, event, data) => {
    const socketId = await getCache(`socket:${userId}`);
    if (socketId) {
        io.to(socketId).emit(event, data);
    }
};
export const emitNotification = async (io, userId, notification) => {
    await emitToUser(io, userId, 'new_notification', notification);
};
