'use client';

import { cn } from '@/lib/utils';
import {
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Hourglass,
    CheckCheck,
} from 'lucide-react';
import { AgreementStatus } from '@/types';
import { Badge } from '@/components/ui';

interface AgreementStatusBadgeProps {
    status: AgreementStatus;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
    AgreementStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'muted';
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    proposal_pending: {
        label: 'Pending Approval',
        variant: 'warning',
        icon: Clock,
    },
    proposal_rejected: {
        label: 'Rejected',
        variant: 'destructive',
        icon: XCircle,
    },
    active: {
        label: 'Active',
        variant: 'success',
        icon: CheckCircle,
    },
    pending_completion: {
        label: 'Awaiting Approval',
        variant: 'default',
        icon: Hourglass,
    },
    completed: {
        label: 'Completed',
        variant: 'success',
        icon: CheckCheck,
    },
    disputed: {
        label: 'Disputed',
        variant: 'destructive',
        icon: AlertTriangle,
    },
};

export function AgreementStatusBadge({
    status,
    size = 'md',
}: AgreementStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <Badge
            variant={config.variant}
            className={cn(
                'gap-1.5',
                size === 'sm' && 'text-[10px] px-2 py-0'
            )}
        >
            <Icon className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
            {config.label}
        </Badge>
    );
}
