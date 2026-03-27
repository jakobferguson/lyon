import { create } from 'zustand';
import { type AppNotification, NOTIFICATION_SEED } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: NOTIFICATION_SEED,
  unreadCount: NOTIFICATION_SEED.filter((n) => !n.read).length,

  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (partial) =>
    set((state) => {
      const newNotification: AppNotification = {
        ...partial,
        id: `notif-${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      const notifications = [newNotification, ...state.notifications];
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),
}));
