import { Server, Socket } from 'socket.io';
import { sendMessageService, markAsSeenService } from '../services/chat.service.js';
import { emitToUser } from './notification.handler.js';
import { prisma } from '../config/db.js';

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  socket.on('join_chat', (chatId: string) => {
    socket.join(chatId);
    console.log(`User ${userId} joined chat ${chatId}`);
  });

  socket.on('leave_chat', (chatId: string) => {
    socket.leave(chatId);
    console.log(`User ${userId} left chat ${chatId}`);
  });

  socket.on('send_message', async (data: { chatId: string, text: string }) => {
    try {
      const msg = await sendMessageService(data.chatId, userId, data.text);
      io.to(data.chatId).emit('new_message', msg);

      // Notify the other participant if they are not in the room
      const chat = await prisma.chat.findUnique({
        where: { id: data.chatId },
        select: { user1Id: true, user2Id: true }
      });
      
      const otherUserId = chat?.user1Id === userId ? chat?.user2Id : chat?.user1Id;
      if (otherUserId) {
        emitToUser(io, otherUserId, 'notification', {
          type: 'NEW_MESSAGE',
          title: 'New Message',
          body: data.text,
          metadata: { chatId: data.chatId }
        });
      }

    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  socket.on('typing', (chatId: string) => {
    socket.to(chatId).emit('user_typing', { userId, chatId });
  });

  socket.on('stop_typing', (chatId: string) => {
    socket.to(chatId).emit('user_stop_typing', { userId, chatId });
  });

  socket.on('mark_seen', async (chatId: string) => {
    try {
      await markAsSeenService(chatId, userId);
      io.to(chatId).emit('messages_seen', { chatId, userId });
    } catch (err) {
      console.error('Error marking seen:', err);
    }
  });
};
