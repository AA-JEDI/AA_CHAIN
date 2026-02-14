'use client';

import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { Badge } from '@/components/ui';
import { Briefcase, User } from 'lucide-react';

interface RoleBadgeProps {
    role: UserRole;
    size?: 'sm' | 'md';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const isCustomer = role === 'customer';

    return (
        <Badge
            variant={isCustomer ? 'default' : 'secondary'}
            className={cn(
                'gap-1',
                size === 'sm' && 'text-[10px] px-1.5 py-0'
            )}
        >
            {isCustomer ? (
                <Briefcase className={cn(size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
            ) : (
                <User className={cn(size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
            )}
            {isCustomer ? 'Customer' : 'Freelancer'}
        </Badge>
    );
}
