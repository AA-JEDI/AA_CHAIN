'use client';

import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { formatAddress, formatDate } from '@/lib/utils';
import { mockTransactions } from '@/mock/wallet';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
    Avatar,
} from '@/components/ui';
import {
    Wallet,
    Copy,
    ExternalLink,
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw,
    Lock,
    AlertTriangle,
} from 'lucide-react';

export default function WalletPage() {
    const { user, wallet } = useAuthStore();
    const { agreements } = useAgreementStore();

    const copyAddress = () => {
        if (wallet?.address) {
            navigator.clipboard.writeText(wallet.address);
        }
    };

    // Calculate escrow-locked funds (funded agreements)
    const escrowLocked = agreements
        .filter(a =>
            (a.customer.id === user?.id || a.freelancer.id === user?.id) &&
            (a.escrow.status === 'funded' || a.escrow.status === 'frozen')
        )
        .reduce((sum, a) => sum + parseFloat(a.escrow.amount), 0);

    // Calculate funds in dispute (frozen agreements)
    const fundsInDispute = agreements
        .filter(a =>
            (a.customer.id === user?.id || a.freelancer.id === user?.id) &&
            a.escrow.status === 'frozen'
        )
        .reduce((sum, a) => sum + parseFloat(a.escrow.amount), 0);

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="text-2xl font-bold">Wallet</h1>
                <p className="text-muted-foreground mt-1">
                    View your connected wallet and transaction history
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main wallet card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                                    <Wallet className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="success">Connected</Badge>
                                    </div>
                                    <p className="text-lg font-mono">
                                        {wallet && formatAddress(wallet.address, 8)}
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <Button variant="outline" size="sm" onClick={copyAddress}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Address
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View on Explorer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction History - Read Only */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {mockTransactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No transactions yet. Transactions from agreements will appear here.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {mockTransactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                                        >
                                            <div
                                                className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'release'
                                                    ? 'bg-emerald-500/10'
                                                    : tx.type === 'refund'
                                                        ? 'bg-amber-500/10'
                                                        : 'bg-primary/10'
                                                    }`}
                                            >
                                                {tx.type === 'release' ? (
                                                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                                                ) : tx.type === 'refund' ? (
                                                    <RefreshCw className="h-5 w-5 text-amber-500" />
                                                ) : (
                                                    <ArrowDownRight className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium capitalize">{tx.type}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(tx.timestamp)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`font-semibold ${tx.type === 'release'
                                                        ? 'text-emerald-500'
                                                        : tx.type === 'deposit'
                                                            ? 'text-destructive'
                                                            : ''
                                                        }`}
                                                >
                                                    {tx.type === 'release' ? '+' : tx.type === 'deposit' ? '-' : ''}
                                                    {tx.amount} {tx.currency}
                                                </p>
                                                <Badge variant={tx.status === 'confirmed' ? 'success' : 'warning'}>
                                                    {tx.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Balance & Escrow Info */}
                <div className="space-y-6">
                    {/* Balance Card - NO SEND/RECEIVE BUTTONS */}
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-primary p-6 text-white">
                            <p className="text-sm opacity-80">Available Balance</p>
                            <p className="text-4xl font-bold mt-1">
                                {wallet?.balance || '0'} ETH
                            </p>
                            <p className="text-sm opacity-70 mt-1">
                                ≈ ${((parseFloat(wallet?.balance || '0') * 3200)).toLocaleString()}
                            </p>
                        </div>
                        {/* Info notice instead of Send/Receive buttons */}
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground text-center">
                                All payments flow through agreement escrows.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Escrow-Locked Funds */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Escrow Locked
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{escrowLocked.toFixed(4)} ETH</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Funds held in active agreements
                            </p>
                        </CardContent>
                    </Card>

                    {/* Funds in Dispute */}
                    <Card className={fundsInDispute > 0 ? 'border-rose-400/50' : ''}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${fundsInDispute > 0 ? 'text-rose-400' : ''}`} />
                                In Dispute
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-bold ${fundsInDispute > 0 ? 'text-rose-400' : ''}`}>
                                {fundsInDispute.toFixed(4)} ETH
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Frozen due to active disputes
                            </p>
                        </CardContent>
                    </Card>

                    {/* Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={user?.avatarUrl}
                                    fallback={user?.username || ''}
                                    size="lg"
                                />
                                <div>
                                    <p className="font-semibold">@{user?.username}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Member since {user && formatDate(user.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
