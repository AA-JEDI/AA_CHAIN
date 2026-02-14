'use client';

import { cn } from '@/lib/utils';
import { FileQuestion, FolderOpen, Inbox, Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: 'search' | 'folder' | 'inbox' | 'file';
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const icons = {
    search: Search,
    folder: FolderOpen,
    inbox: Inbox,
    file: FileQuestion,
};

export function EmptyState({
    icon = 'inbox',
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    const Icon = icons[icon];

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            <div className="rounded-full bg-muted p-4 mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick}>{action.label}</Button>
            )}
        </div>
    );
}
