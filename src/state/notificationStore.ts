import { create } from 'zustand';
import { Notification } from '@/types';
import { mockNotifications } from '@/mock/notifications';
import { notificationService } from '@/services/notificationService';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;

    // Actions
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    setLoading: (isLoading: boolean) => void;
    initializeSubscription: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter((n) => !n.read).length,
    isLoading: false,

    setNotifications: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
        }),

    // Issue #13: Add notification and update UI immediately
    addNotification: (notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        })),

    markAsRead: (notificationId) =>
        set((state) => {
            const notification = state.notifications.find(
                (n) => n.id === notificationId
            );
            const wasUnread = notification && !notification.read;

            // Call service
            notificationService.markAsRead(notificationId);

            return {
                notifications: state.notifications.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                ),
                unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
            };
        }),

    markAllAsRead: () =>
        set((state) => {
            // Call service
            const userId = state.notifications[0]?.userId;
            if (userId) {
                notificationService.markAllAsRead(userId);
            }

            return {
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
                unreadCount: 0,
            };
        }),

    setLoading: (isLoading) => set({ isLoading }),

    // Issue #13: Subscribe to real-time notification updates
    initializeSubscription: () => {
        return notificationService.subscribe((notification) => {
            get().addNotification(notification);
        });
    },
}));
