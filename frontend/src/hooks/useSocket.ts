import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import api from '../lib/api';

export function useSocket() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    connectSocket();
    const socket = getSocket();

    const onMessage = (data: any) => {
      const message = data?.message || data;
      const chatId = data?.chatId || message?.chatId;
      if (chatId && message?.id) {
        useChatStore.getState().addMessage(chatId, message);
      }
    };

    const onNotification = (data: any) => {
      useNotificationStore.getState().addNotification(data);
    };

    socket.on('new_message', onMessage);
    socket.on('new_notification', onNotification);

    const loadChats = () => {
      api.get('/api/chats').then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        useChatStore.getState().setChats(rows);
        const live = getSocket();
        rows.forEach((chat: { id: string }) => live.emit('join_chat', chat.id));
      }).catch(() => undefined);
    };
    const idle = window.setTimeout(loadChats, 800);

    return () => {
      window.clearTimeout(idle);
      socket.off('new_message', onMessage);
      socket.off('new_notification', onNotification);
    };
  }, [isAuthenticated]);
}
