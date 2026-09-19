import { verifyToken } from '../utils/jwt.js';
import { setCache, delCache } from '../config/redis.js';
import { prisma } from '../config/db.js';
import { registerChatHandlers } from './chat.handler.js';
export const initializeSocket = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error'));
        const decoded = verifyToken(token);
        if (!decoded)
            return next(new Error('Authentication error'));
        socket.data.userId = decoded.id;
        next();
    });
    io.on('connection', async (socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${userId} (Socket: ${socket.id})`);
        // Presence is best-effort. A failed cache or database write must never
        // reject out of this handler: an unhandled rejection here would take the
        // whole API process down, so a transient outage would become an outage
        // for every HTTP route too.
        try {
            await setCache(`socket:${userId}`, socket.id);
            await prisma.user.update({
                where: { id: userId },
                data: { isOnline: true }
            });
            socket.broadcast.emit('user_status', { userId, isOnline: true });
        }
        catch (err) {
            console.error(`[socket] could not mark ${userId} online:`, err?.message || err);
        }
        registerChatHandlers(io, socket);
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);
            const lastSeen = new Date();
            try {
                await delCache(`socket:${userId}`);
                await prisma.user.update({
                    where: { id: userId },
                    data: { isOnline: false, lastSeen }
                });
            }
            catch (err) {
                console.error(`[socket] could not mark ${userId} offline:`, err?.message || err);
            }
            socket.broadcast.emit('user_status', { userId, isOnline: false, lastSeen });
        });
        socket.on('error', (err) => {
            console.error(`[socket] error for ${userId}:`, err?.message || err);
        });
    });
};
