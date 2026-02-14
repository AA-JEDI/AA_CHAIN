'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts';
import { Button, Card } from '@/components/ui';
import { useAuthStore } from '@/state/authStore';
import { formatAddress } from '@/lib/utils';
import { Wallet, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const {
        wallet,
        connectWallet,
        isConnecting,
        isAuthenticated,
        error,
        setError,
        resetAuthState
    } = useAuthStore();

    // Issue #2: Reset auth state on mount to ensure clean login
    React.useEffect(() => {
        // Clear any stale error from previous attempts
        setError(null);
    }, [setError]);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && wallet?.connected) {
            router.push('/home');
        }
    }, [isAuthenticated, wallet, router]);

    const handleConnect = async () => {
        // Issue #2: Clear previous errors before new attempt
        setError(null);

        try {
            await connectWallet();
            // Navigation handled by the useEffect above when isAuthenticated becomes true
        } catch (err) {
            // Error already handled in store
            console.log('[Login] Connection failed');
        }
    };

    // Issue #2: Allow retry by resetting state
    const handleRetry = () => {
        resetAuthState();
    };

    return (
        <AuthLayout
            title="Welcome to FreelanceDAO"
            subtitle="Connect your MetaMask wallet to access trustless freelance agreements"
        >
            <div className="space-y-6">
                {/* Wallet Connection Status Card */}
                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${wallet?.connected
                                ? 'bg-emerald-500/20'
                                : error
                                    ? 'bg-destructive/20'
                                    : 'bg-muted'
                            }`}>
                            {wallet?.connected ? (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : error ? (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            ) : (
                                <Wallet className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium">
                                {wallet?.connected
                                    ? 'Wallet Connected'
                                    : error
                                        ? 'Connection Failed'
                                        : isConnecting
                                            ? 'Connecting...'
                                            : 'No Wallet Connected'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {wallet?.connected
                                    ? formatAddress(wallet.address)
                                    : error
                                        ? 'Click retry or try again'
                                        : 'Connect your wallet to continue'}
                            </p>
                        </div>
                    </div>

                    {/* Wallet Address Preview when connected */}
                    {wallet?.connected && (
                        <div className="p-3 rounded-lg bg-muted/50 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Address</span>
                                <span className="text-sm font-mono">{formatAddress(wallet.address, 8)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-muted-foreground">Balance</span>
                                <span className="text-sm font-medium">{parseFloat(wallet.balance).toFixed(4)} ETH</span>
                            </div>
                        </div>
                    )}

                    {/* Connect Button */}
                    <Button
                        onClick={handleConnect}
                        className="w-full h-12"
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Connecting to MetaMask...
                            </>
                        ) : wallet?.connected ? (
                            <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Connected - Entering Dashboard...
                            </>
                        ) : (
                            <>
                                <Wallet className="h-5 w-5 mr-2" />
                                Connect with MetaMask
                            </>
                        )}
                    </Button>
                </Card>

                {/* Error message with retry option - Issue #2 */}
                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 text-destructive text-sm mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                            >
                                Reset & Retry
                            </Button>
                            {error.includes('not installed') && (
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline px-2"
                                >
                                    Install MetaMask
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Why MetaMask?
                        </span>
                    </div>
                </div>

                {/* MetaMask info */}
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Secure Authentication</p>
                            <p>Your wallet address is your identity. No passwords to remember.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Direct Payments</p>
                            <p>Escrow funds flow directly between wallets. No intermediaries.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have MetaMask?{' '}
                    <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        Download here
                    </a>
                </p>
            </div>
        </AuthLayout>
    );
}
