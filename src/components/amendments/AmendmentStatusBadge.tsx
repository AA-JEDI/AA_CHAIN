'use client';

import { cn } from '@/lib/utils';
import { AmendmentStatus } from '@/types';
import { Badge } from '@/components/ui';
import { Clock, CheckCircle, XCircle, UserCheck } from 'lucide-react';

interface AmendmentStatusBadgeProps {
    status: AmendmentStatus;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
    AmendmentStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'muted';
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    pending: {
        label: 'Pending',
        variant: 'warning',
        icon: Clock,
    },
    approved_by_customer: {
        label: 'Customer Approved',
        variant: 'default',
        icon: UserCheck,
    },
    approved_by_freelancer: {
        label: 'Freelancer Approved',
        variant: 'default',
        icon: UserCheck,
    },
    approved: {
        label: 'Approved',
        variant: 'success',
        icon: CheckCircle,
    },
    rejected: {
        label: 'Rejected',
        variant: 'destructive',
        icon: XCircle,
    },
};

export function AmendmentStatusBadge({
    status,
    size = 'md',
}: AmendmentStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <Badge
            variant={config.variant}
            className={cn('gap-1', size === 'sm' && 'text-[10px] px-1.5 py-0')}
        >
            <Icon className={cn('shrink-0', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
            {config.label}
        </Badge>
    );
}
