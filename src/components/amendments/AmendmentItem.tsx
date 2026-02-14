'use client';

import * as React from 'react';
import { Amendment, Agreement } from '@/types';
import { formatDate, formatCurrency, getUserRole } from '@/lib/utils';
import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { useUIStore } from '@/state/uiStore';
import { amendmentService, notificationService } from '@/services';
import { Card, CardContent, Button, Avatar } from '@/components/ui';
import { AmendmentStatusBadge } from './AmendmentStatusBadge';
import { getUserById } from '@/mock/users';
import { Check, X, ArrowRight, Calendar, DollarSign, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmendmentItemProps {
    amendment: Amendment;
    agreement: Agreement;
}

export function AmendmentItem({ amendment, agreement }: AmendmentItemProps) {
    const { user } = useAuthStore();
    const { updateAmendment, updateAgreement } = useAgreementStore();
    const { addToast } = useUIStore();
    const [isLoading, setIsLoading] = React.useState(false);

    const proposer = getUserById(amendment.proposedBy);
    const userRole = user ? getUserRole(agreement, user.id) : null;
    const isProposer = user?.id === amendment.proposedBy;
    const canRespond = !isProposer && amendment.status === 'pending';

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            const updated = await amendmentService.approveAmendment(amendment.id);
            updateAmendment(updated);

            // If approved, update agreement with new values
            if (updated.status === 'approved') {
                const updatedAgreement = { ...agreement };
                if (amendment.changes.timeline) {
                    updatedAgreement.timeline = amendment.changes.timeline.proposed;
                }
                if (amendment.changes.price) {
                    updatedAgreement.price = amendment.changes.price.proposed;
                }
                if (amendment.changes.description) {
                    updatedAgreement.description = amendment.changes.description.proposed;
                }
                updateAgreement(updatedAgreement);
            }

            notificationService.emit({
                type: 'amendment_approved',
                recipientId: amendment.proposedBy,
                agreementId: agreement.id,
                amendmentId: amendment.id,
            });

            addToast({
                type: 'success',
                title: 'Amendment Approved',
                message: 'The amendment has been applied to the agreement.',
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to approve amendment.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            const updated = await amendmentService.rejectAmendment(amendment.id);
            updateAmendment(updated);

            notificationService.emit({
                type: 'amendment_rejected',
                recipientId: amendment.proposedBy,
                agreementId: agreement.id,
                amendmentId: amendment.id,
            });

            addToast({
                type: 'info',
                title: 'Amendment Rejected',
                message: 'The amendment has been rejected.',
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to reject amendment.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        {proposer && (
                            <Avatar
                                src={proposer.avatarUrl}
                                fallback={proposer.username}
                                size="sm"
                            />
                        )}
                        <div>
                            <p className="text-sm font-medium">
                                @{proposer?.username || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(amendment.createdAt)}
                            </p>
                        </div>
                    </div>
                    <AmendmentStatusBadge status={amendment.status} size="sm" />
                </div>

                {/* Reason */}
                <p className="text-sm text-muted-foreground mb-4">{amendment.reason}</p>

                {/* Changes */}
                <div className="space-y-3">
                    {amendment.changes.timeline && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground line-through">
                                {formatDate(amendment.changes.timeline.previous.endDate)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-primary">
                                {formatDate(amendment.changes.timeline.proposed.endDate)}
                            </span>
                        </div>
                    )}

                    {amendment.changes.price && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground line-through">
                                {formatCurrency(amendment.changes.price.previous)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-primary">
                                {formatCurrency(amendment.changes.price.proposed)}
                            </span>
                        </div>
                    )}

                    {amendment.changes.description && (
                        <div className="text-sm p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Description updated</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {amendment.changes.description.proposed}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {canRespond && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button size="sm" onClick={handleApprove} loading={isLoading}>
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReject}
                            disabled={isLoading}
                        >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                        </Button>
                    </div>
                )}

                {isProposer && amendment.status === 'pending' && (
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                        Waiting for the other party to respond...
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
