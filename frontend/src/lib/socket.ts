import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { getSocketUrl } from './publicUrl';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const token = useAuthStore.getState().token;
    socket = io(getSocketUrl(), {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      transports: ['polling', 'websocket'],
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
