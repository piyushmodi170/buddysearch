import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';

export function useSocket() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addMessage = useChatStore((state) => state.addMessage);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
      const socket = getSocket();

      socket.on('new_message', (data: any) => {
        addMessage(data.chatId, data.message);
      });

      socket.on('new_notification', (data: any) => {
        addNotification(data);
      });

      return () => {
        socket.off('new_message');
        socket.off('new_notification');
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, addMessage, addNotification]);
}
