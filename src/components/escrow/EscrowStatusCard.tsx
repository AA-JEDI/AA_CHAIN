'use client';

import { EscrowState } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { EscrowStatusIndicator } from './EscrowStatusIndicator';
import { Wallet, ArrowDownRight, ArrowUpRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EscrowStatusCardProps {
    escrow: EscrowState;
    currency?: string;
}

const DESCRIPTIONS = {
    unfunded: 'Funds have not been deposited yet. The customer must fund the escrow.',
    pending: 'Transaction is being confirmed on the blockchain.',
    funded: 'Funds are safely held in escrow and will be released upon completion.',
    frozen: 'Funds are frozen due to an active dispute.',
    released: 'Funds have been successfully released to the freelancer.',
    refunded: 'Funds have been refunded to the customer.',
};

export function EscrowStatusCard({ escrow, currency = 'ETH' }: EscrowStatusCardProps) {
    const isFunded = escrow.status === 'funded' || escrow.status === 'frozen';

    return (
        <Card
            className={cn(
                escrow.status === 'frozen' && 'border-destructive/50',
                escrow.status === 'funded' && 'border-emerald-500/30'
            )}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wallet className="h-5 w-5" />
                        Escrow Status
                    </CardTitle>
                    <EscrowStatusIndicator status={escrow.status} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Amount */}
                    <div
                        className={cn(
                            'p-4 rounded-lg text-center',
                            escrow.status === 'frozen'
                                ? 'bg-destructive/10'
                                : escrow.status === 'funded'
                                    ? 'bg-emerald-500/10'
                                    : 'bg-muted'
                        )}
                    >
                        <p className="text-sm text-muted-foreground mb-1">Escrow Amount</p>
                        <p className="text-3xl font-bold">
                            {formatCurrency(escrow.amount, currency)}
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                        {DESCRIPTIONS[escrow.status]}
                    </p>

                    {/* Timeline */}
                    <div className="space-y-2">
                        {escrow.fundedAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                                <span className="text-muted-foreground">Funded:</span>
                                <span>{formatDateTime(escrow.fundedAt)}</span>
                            </div>
                        )}
                        {escrow.frozenAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <Lock className="h-4 w-4 text-destructive" />
                                <span className="text-muted-foreground">Frozen:</span>
                                <span>{formatDateTime(escrow.frozenAt)}</span>
                            </div>
                        )}
                        {escrow.releasedAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                <span className="text-muted-foreground">Released:</span>
                                <span>{formatDateTime(escrow.releasedAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Visual indicator */}
                    {isFunded && escrow.status !== 'frozen' && (
                        <div className="flex items-center justify-center pt-2">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Lock className="h-8 w-8 text-emerald-500" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse-ring" />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
