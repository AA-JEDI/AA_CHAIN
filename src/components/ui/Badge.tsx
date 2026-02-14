'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-primary/10 text-primary border border-primary/20',
                secondary: 'bg-secondary text-secondary-foreground',
                success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
                outline: 'bg-transparent border border-border text-foreground',
                muted: 'bg-muted text-muted-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
