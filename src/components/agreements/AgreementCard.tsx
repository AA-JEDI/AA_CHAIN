'use client';

import Link from 'next/link';
import { Agreement } from '@/types';
import { formatDate, formatCurrency, getUserRole } from '@/lib/utils';
import { useAuthStore } from '@/state/authStore';
import { Card, CardContent, Avatar } from '@/components/ui';
import { AgreementStatusBadge } from './AgreementStatusBadge';
import { RoleBadge } from './RoleBadge';
import { EscrowStatusIndicator } from '@/components/escrow/EscrowStatusIndicator';
import { Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgreementCardProps {
    agreement: Agreement;
}

export function AgreementCard({ agreement }: AgreementCardProps) {
    const { user } = useAuthStore();
    const userRole = user ? getUserRole(agreement, user.id) : null;
    const otherParty =
        userRole === 'customer' ? agreement.freelancer : agreement.customer;

    return (
        <Link href={`/projects/${agreement.id}`}>
            <Card className="hover-lift cursor-pointer transition-all duration-200 hover:border-primary/50">
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                                {agreement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {agreement.description}
                            </p>
                        </div>
                        <AgreementStatusBadge status={agreement.status} size="sm" />
                    </div>

                    {/* Other party */}
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50">
                        <Avatar
                            src={otherParty.avatarUrl}
                            fallback={otherParty.username}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                @{otherParty.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {userRole === 'customer' ? 'Freelancer' : 'Customer'}
                            </p>
                        </div>
                        {userRole && <RoleBadge role={userRole} size="sm" />}
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium text-foreground">
                                    {formatCurrency(agreement.price, agreement.currency)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(agreement.timeline.endDate)}</span>
                            </div>
                        </div>
                        <EscrowStatusIndicator status={agreement.escrow.status} />
                    </div>

                    {/* Action hint */}
                    <div className="flex items-center justify-end mt-4 text-xs text-muted-foreground">
                        <span>View details</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
