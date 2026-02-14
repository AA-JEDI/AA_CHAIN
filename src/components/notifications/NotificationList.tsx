'use client';

import Link from 'next/link';
import { Notification, NotificationType } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { useNotificationStore } from '@/state/notificationStore';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
    FileText,
    CheckCircle,
    XCircle,
    FileEdit,
    AlertTriangle,
    Wallet,
    ArrowUpRight,
    Bell,
} from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
}

const ICON_CONFIG: Record<
    NotificationType,
    { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
    agreement_proposal: { icon: FileText, color: 'text-primary' },
    agreement_accepted: { icon: CheckCircle, color: 'text-emerald-500' },
    agreement_rejected: { icon: XCircle, color: 'text-destructive' },
    amendment_proposed: { icon: FileEdit, color: 'text-amber-500' },
    amendment_approved: { icon: CheckCircle, color: 'text-emerald-500' },
    amendment_rejected: { icon: XCircle, color: 'text-destructive' },
    completion_approved: { icon: CheckCircle, color: 'text-emerald-500' },
    project_completed: { icon: CheckCircle, color: 'text-emerald-500' },
    dispute_raised: { icon: AlertTriangle, color: 'text-rose-400' },
    settlement_proposed: { icon: FileEdit, color: 'text-amber-500' },
    settlement_accepted: { icon: CheckCircle, color: 'text-emerald-500' },
    escrow_funded: { icon: Wallet, color: 'text-primary' },
    escrow_released: { icon: ArrowUpRight, color: 'text-emerald-500' },
};

export function NotificationItem({ notification }: NotificationItemProps) {
    const { markAsRead } = useNotificationStore();
    const config = ICON_CONFIG[notification.type];
    const Icon = config.icon;

    const handleClick = () => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };

    const content = (
        <Card
            className={cn(
                'p-4 transition-all cursor-pointer hover:bg-accent/50',
                !notification.read && 'bg-primary/5 border-primary/20'
            )}
            onClick={handleClick}
        >
            <div className="flex gap-4">
                <div
                    className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                        notification.read ? 'bg-muted' : 'bg-primary/10'
                    )}
                >
                    <Icon className={cn('h-5 w-5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {formatRelativeTime(notification.createdAt)}
                    </p>
                </div>
            </div>
        </Card>
    );

    if (notification.agreementId) {
        return (
            <Link href={`/projects/${notification.agreementId}`}>{content}</Link>
        );
    }

    return content;
}

export function NotificationList() {
    const { notifications } = useNotificationStore();

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    You&apos;re all caught up!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
        </div>
    );
}
