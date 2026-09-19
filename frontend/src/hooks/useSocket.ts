import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';

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

    return () => {
      socket.off('new_message', onMessage);
      socket.off('new_notification', onNotification);
    };
  }, [isAuthenticated]);
}
