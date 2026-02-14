'use client';

import { cn } from '@/lib/utils';
import { EscrowStatus } from '@/types';
import { Badge } from '@/components/ui';
import { Lock, Unlock, Clock, Snowflake, CheckCircle } from 'lucide-react';

interface EscrowStatusIndicatorProps {
    status: EscrowStatus;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
    EscrowStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'muted';
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    unfunded: {
        label: 'Unfunded',
        variant: 'muted',
        icon: Unlock,
    },
    pending: {
        label: 'Processing',
        variant: 'warning',
        icon: Clock,
    },
    funded: {
        label: 'Secured',
        variant: 'success',
        icon: Lock,
    },
    frozen: {
        label: 'Frozen',
        variant: 'destructive',
        icon: Snowflake,
    },
    released: {
        label: 'Released',
        variant: 'success',
        icon: CheckCircle,
    },
    refunded: {
        label: 'Refunded',
        variant: 'secondary',
        icon: Unlock,
    },
};

export function EscrowStatusIndicator({
    status,
    size = 'md',
}: EscrowStatusIndicatorProps) {
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
