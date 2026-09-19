import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import api from '../lib/api';

export function useSocket() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addMessage = useChatStore((state) => state.addMessage);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
      const socket = getSocket();

      socket.on('new_message', (data: any) => {
        const message = data?.message || data;
        const chatId = data?.chatId || message?.chatId;
        if (chatId && message?.id) {
          addMessage(chatId, message);
        }
      });

      socket.on('new_notification', (data: any) => {
        addNotification(data);
      });

      api.get('/api/chats').then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        useChatStore.getState().setChats(rows);
        rows.forEach((chat: { id: string }) => socket.emit('join_chat', chat.id));
      }).catch(() => undefined);

      return () => {
        socket.off('new_message');
        socket.off('new_notification');
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, addMessage, addNotification]);
}
