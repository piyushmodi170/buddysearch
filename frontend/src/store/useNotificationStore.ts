import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'PROFILE_VIEW' | 'MESSAGE' | 'REQUEST_RESPONSE' | 'SYSTEM';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setNotifications: (notifications: AppNotification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => set((state) => {
    const updated = [notification, ...state.notifications];
    return { notifications: updated, unreadCount: state.unreadCount + 1 };
  }),
  markRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { notifications: updated, unreadCount: Math.max(0, state.unreadCount - 1) };
  }),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  }),
}));
