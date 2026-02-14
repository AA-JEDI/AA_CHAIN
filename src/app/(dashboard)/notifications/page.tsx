'use client';

import { useNotificationStore } from '@/state/notificationStore';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { NotificationList } from '@/components/notifications';
import { CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
    const { unreadCount, markAllAsRead } = useNotificationStore();

    return (
        <div className="space-y-6 animate-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground mt-1">
                        Stay updated on your agreements
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        All Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                                {unreadCount} unread
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <NotificationList />
                </CardContent>
            </Card>
        </div>
    );
}
