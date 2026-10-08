import { Server, Socket } from 'socket.io';
import { findChatForUser, sendMessageService, markAsSeenService } from '../services/chat.service.js';
import { emitToUser } from './notification.handler.js';

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  socket.on('join_chat', async (chatId: string) => {
    try {
      const chat = await findChatForUser(chatId, userId);
      if (!chat) return;
      socket.join(chat.id);
    } catch (err) {
      console.error('Error joining chat:', err);
    }
  });

  socket.on('leave_chat', (chatId: string) => {
    socket.leave(chatId);
  });

  socket.on('send_message', async (data: { chatId: string, text: string }) => {
    try {
      const msg = await sendMessageService(data.chatId, userId, data.text);
      io.to(data.chatId).emit('new_message', { chatId: data.chatId, message: msg });

      const chat = await findChatForUser(data.chatId, userId);
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

  socket.on('typing', async (chatId: string) => {
    const chat = await findChatForUser(chatId, userId).catch(() => null);
    if (!chat) return;
    socket.to(chat.id).emit('user_typing', { userId, chatId: chat.id });
  });

  socket.on('stop_typing', async (chatId: string) => {
    const chat = await findChatForUser(chatId, userId).catch(() => null);
    if (!chat) return;
    socket.to(chat.id).emit('user_stop_typing', { userId, chatId: chat.id });
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
