import { Server } from 'socket.io';
import { getCache } from '../config/redis.js';

export const emitToUser = async (io: Server, userId: string, event: string, data: any) => {
  const socketId = await getCache(`socket:${userId}`);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

export const emitNotification = async (io: Server, userId: string, notification: any) => {
  await emitToUser(io, userId, 'new_notification', notification);
};
