'use client';

import * as React from 'react';
import { Button, Card } from '@/components/ui';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
    const router = useRouter();

    React.useEffect(() => {
        console.error('[Dashboard Error] Caught error:', error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-md w-full p-6 text-center space-y-4">
                {/* Error Icon */}
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>

                {/* Error Message */}
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Page Error</h2>
                    <p className="text-sm text-muted-foreground">
                        Something went wrong loading this page.
                    </p>
                </div>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="p-3 rounded-lg bg-muted text-left">
                        <p className="text-xs font-mono text-muted-foreground break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button onClick={reset} size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                    <Button onClick={() => router.back()} variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </Card>
        </div>
    );
}
