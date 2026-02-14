'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/state/uiStore';

interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    onClose: () => void;
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const styles = {
    success: 'border-emerald-500/20 bg-emerald-500/10',
    error: 'border-destructive/20 bg-destructive/10',
    warning: 'border-amber-500/20 bg-amber-500/10',
    info: 'border-primary/20 bg-primary/10',
};

const iconStyles = {
    success: 'text-emerald-500',
    error: 'text-destructive',
    warning: 'text-amber-500',
    info: 'text-primary',
};

function Toast({ id, type, title, message, onClose }: ToastProps) {
    const Icon = icons[type];

    React.useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in',
                styles[type]
            )}
        >
            <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', iconStyles[type])} />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{title}</p>
                {message && (
                    <p className="text-sm text-muted-foreground mt-1">{message}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const { toasts, removeToast } = useUIStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
