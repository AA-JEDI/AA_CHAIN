'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/state/authStore';
import { Wallet, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const { connectWallet, login, isConnecting, wallet } = useAuthStore();

    const [step, setStep] = React.useState<'connect' | 'profile'>('connect');
    const [username, setUsername] = React.useState('');
    const [agreed, setAgreed] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleConnect = async () => {
        await connectWallet();
        setStep('profile');
    };

    const handleSubmit = async () => {
        if (!username.trim() || !agreed || !wallet) return;

        setIsSubmitting(true);
        // Simulate account creation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        login(
            {
                id: `user_${Date.now()}`,
                walletAddress: wallet.address,
                username,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                createdAt: new Date().toISOString(),
            },
            wallet
        );

        router.push('/home');
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Get started with FreelanceDAO"
        >
            {step === 'connect' ? (
                <div className="space-y-6">
                    <Card className="p-6 text-center">
                        <div className="h-16 w-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                            <Wallet className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your wallet address will be used as your unique identifier on the
                            platform.
                        </p>
                        <Button
                            onClick={handleConnect}
                            className="w-full"
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <Wallet className="h-5 w-5 mr-2" />
                            )}
                            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                    </Card>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <Card className="p-4 flex items-center gap-3 bg-emerald-500/10 border-emerald-500/20">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Wallet Connected</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {wallet?.address}
                            </p>
                        </div>
                    </Card>

                    <Input
                        label="Username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 rounded border-input"
                        />
                        <span className="text-sm text-muted-foreground">
                            I agree to the{' '}
                            <a href="#" className="text-primary hover:underline">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-primary hover:underline">
                                Privacy Policy
                            </a>
                        </span>
                    </label>

                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={!username.trim() || !agreed}
                        loading={isSubmitting}
                    >
                        Create Account
                    </Button>
                </div>
            )}
        </AuthLayout>
    );
}
