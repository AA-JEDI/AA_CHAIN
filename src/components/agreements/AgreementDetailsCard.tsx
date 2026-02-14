'use client';

import { Agreement } from '@/types';
import { cn, formatDate, formatCurrency, getUserRole } from '@/lib/utils';
import { useAuthStore } from '@/state/authStore';
import { Card, CardHeader, CardTitle, CardContent, Avatar } from '@/components/ui';
import { AgreementStatusBadge } from './AgreementStatusBadge';
import { RoleBadge } from './RoleBadge';
import { Calendar, FileText, DollarSign, Users } from 'lucide-react';

interface AgreementDetailsCardProps {
    agreement: Agreement;
}

export function AgreementDetailsCard({ agreement }: AgreementDetailsCardProps) {
    const { user } = useAuthStore();
    const userRole = user ? getUserRole(agreement, user.id) : null;

    return (
        <div className="space-y-6">
            {/* Title and Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">{agreement.title}</CardTitle>
                            <p className="text-muted-foreground mt-2">{agreement.description}</p>
                        </div>
                        <AgreementStatusBadge status={agreement.status} />
                    </div>
                </CardHeader>
            </Card>

            {/* Participants */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="h-5 w-5" />
                        Participants
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Customer */}
                        <div
                            className={cn(
                                'flex items-center gap-3 p-4 rounded-lg border',
                                userRole === 'customer' && 'border-primary bg-primary/5'
                            )}
                        >
                            <Avatar
                                src={agreement.customer.avatarUrl}
                                fallback={agreement.customer.username}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    @{agreement.customer.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {agreement.customer.walletAddress}
                                </p>
                            </div>
                            <RoleBadge role="customer" />
                        </div>

                        {/* Freelancer */}
                        <div
                            className={cn(
                                'flex items-center gap-3 p-4 rounded-lg border',
                                userRole === 'freelancer' && 'border-primary bg-primary/5'
                            )}
                        >
                            <Avatar
                                src={agreement.freelancer.avatarUrl}
                                fallback={agreement.freelancer.username}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    @{agreement.freelancer.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {agreement.freelancer.walletAddress}
                                </p>
                            </div>
                            <RoleBadge role="freelancer" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Agreement Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5" />
                        Agreement Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="text-lg font-semibold flex items-center gap-1">
                                <DollarSign className="h-5 w-5 text-primary" />
                                {formatCurrency(agreement.price, agreement.currency)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Timeline</p>
                            <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(agreement.timeline.startDate)} →{' '}
                                {formatDate(agreement.timeline.endDate)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">{formatDate(agreement.createdAt)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="font-medium">{formatDate(agreement.updatedAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
