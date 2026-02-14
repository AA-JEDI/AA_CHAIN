'use client';

import * as React from 'react';
import { Agreement, UserRole } from '@/types';
import { getUserRole, hasUserApprovedCompletion } from '@/lib/utils';
import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { useUIStore } from '@/state/uiStore';
import { useNotificationStore } from '@/state/notificationStore';
import { agreementService, notificationService, escrowService } from '@/services';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CheckCircle, AlertTriangle, FileEdit, Check, X, Clock, Wallet, Send, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectActionsProps {
    agreement: Agreement;
    onOpenAmendment: () => void;
    onOpenDispute: () => void;
}

export function ProjectActions({
    agreement,
    onOpenAmendment,
    onOpenDispute,
}: ProjectActionsProps) {
    const { user } = useAuthStore();
    const { updateAgreement } = useAgreementStore();
    const { addToast } = useUIStore();
    const { addNotification } = useNotificationStore();
    const [isLoading, setIsLoading] = React.useState(false);

    const userRole = user ? getUserRole(agreement, user.id) : null;
    const isCustomer = userRole === 'customer';
    const isFreelancer = userRole === 'freelancer';

    const hasApproved = user ? hasUserApprovedCompletion(agreement, user.id) : false;
    const isActive = agreement.status === 'active' || agreement.status === 'pending_completion';
    const isPending = agreement.status === 'proposal_pending';
    const isCompleted = agreement.status === 'completed';
    const isDisputed = agreement.status === 'disputed';

    // Calculate dispute bond (5% of agreement value)
    const disputeBond = escrowService.calculateDisputeBond(agreement.price);

    // Check if grace period has expired
    const checkGracePeriodExpiry = React.useCallback(() => {
        if (!agreement.timeline.gracePeriodDate) return;

        const gracePeriodEnd = new Date(agreement.timeline.gracePeriodDate);
        const now = new Date();

        if (now > gracePeriodEnd && agreement.status === 'pending_completion') {
            if (agreement.completion.freelancerApproved && !agreement.completion.customerApproved) {
                escrowService.autoRelease(agreement.id, 'freelancer');
            } else if (agreement.completion.customerApproved && !agreement.completion.freelancerApproved) {
                escrowService.autoRelease(agreement.id, 'customer');
            }
        }
    }, [agreement]);

    React.useEffect(() => {
        checkGracePeriodExpiry();
    }, [checkGracePeriodExpiry]);

    // Freelancer submits work
    const handleSubmitWork = async () => {
        if (!user || !isFreelancer) return;
        setIsLoading(true);

        try {
            await escrowService.submitWork(agreement.id);

            notificationService.emit({
                type: 'completion_approved',
                recipientId: agreement.customer.id,
                agreementId: agreement.id,
                message: `${user.username} has submitted work for "${agreement.title}"`,
            });

            addNotification({
                id: `notif_${Date.now()}`,
                type: 'completion_approved',
                userId: agreement.customer.id,
                title: 'Work Submitted',
                message: `${user.username} has submitted work for "${agreement.title}"`,
                agreementId: agreement.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            addToast({
                type: 'success',
                title: 'Work Submitted',
                message: 'The customer has been notified to review your work.',
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to submit work.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Issue #3: ONLY CUSTOMER can mark as complete
     * When customer marks complete -> project immediately moves to Completed
     */
    const handleMarkComplete = async () => {
        // Issue #3: Only customer can mark complete
        if (!user || !isCustomer) return;
        setIsLoading(true);

        try {
            // When customer marks complete, project is DONE
            const updated: Agreement = {
                ...agreement,
                status: 'completed',
                completion: {
                    customerApproved: true,
                    freelancerApproved: true, // Auto-approve freelancer when customer completes
                },
                escrow: {
                    ...agreement.escrow,
                    status: 'released',
                    releasedAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
            };

            updateAgreement(updated);

            notificationService.emit({
                type: 'project_completed',
                recipientId: agreement.freelancer.id,
                agreementId: agreement.id,
            });

            addNotification({
                id: `notif_${Date.now()}`,
                type: 'project_completed',
                userId: agreement.freelancer.id,
                title: 'Project Completed',
                message: `Project "${agreement.title}" has been completed. Funds released!`,
                agreementId: agreement.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            addToast({
                type: 'success',
                title: 'Project Completed',
                message: 'Escrow funds have been released to the freelancer.',
            });

            await escrowService.releaseFunds(agreement.id);
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to mark as complete.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Issue #5: Client can override dispute by marking complete
     * This unfreezes escrow and refunds the 5% bond
     */
    const handleOverrideDispute = async () => {
        if (!user || !isCustomer) return;
        setIsLoading(true);

        try {
            // Client overrides dispute - project becomes completed
            const updated: Agreement = {
                ...agreement,
                status: 'completed',
                completion: {
                    customerApproved: true,
                    freelancerApproved: true,
                },
                escrow: {
                    ...agreement.escrow,
                    status: 'released',
                    releasedAt: new Date().toISOString(),
                    frozenAt: null, // Clear frozen state
                },
                dispute: {
                    ...agreement.dispute!,
                    status: 'resolved',
                },
                updatedAt: new Date().toISOString(),
            };

            updateAgreement(updated);

            // Refund the dispute bond
            addToast({
                type: 'success',
                title: 'Dispute Resolved',
                message: `Project completed. ${disputeBond} ${agreement.currency} bond refunded.`,
            });

            addNotification({
                id: `notif_${Date.now()}`,
                type: 'project_completed',
                userId: agreement.freelancer.id,
                title: 'Dispute Resolved',
                message: `Client resolved the dispute on "${agreement.title}". Funds released.`,
                agreementId: agreement.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            await escrowService.releaseFunds(agreement.id);
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to resolve dispute.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Issue #5: Client can override dispute by proposing amendment
     * This unfreezes escrow and refunds the 5% bond
     */
    const handleDisputeAmendment = () => {
        if (!isCustomer) return;

        // Unfreeze escrow before opening amendment modal
        const updated: Agreement = {
            ...agreement,
            status: 'active', // Return to active status
            escrow: {
                ...agreement.escrow,
                status: 'funded',
                frozenAt: null,
            },
            dispute: null, // Clear dispute
            updatedAt: new Date().toISOString(),
        };

        updateAgreement(updated);

        addToast({
            type: 'info',
            title: 'Dispute Cancelled',
            message: `Escrow unfrozen. ${disputeBond} ${agreement.currency} bond refunded.`,
        });

        // Now open amendment modal
        onOpenAmendment();
    };

    const handleAcceptProposal = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const updated = await agreementService.respondToProposal({
                agreementId: agreement.id,
                accept: true,
            });
            updateAgreement(updated);

            notificationService.emit({
                type: 'agreement_accepted',
                recipientId: agreement.initiatedBy,
                agreementId: agreement.id,
            });

            addNotification({
                id: `notif_${Date.now()}`,
                type: 'agreement_accepted',
                userId: agreement.initiatedBy,
                title: 'Agreement Accepted',
                message: `${user.username} accepted your agreement "${agreement.title}"`,
                agreementId: agreement.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            addToast({
                type: 'success',
                title: 'Agreement Accepted',
                message: 'You have accepted the agreement. Work can now begin!',
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to accept agreement.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectProposal = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const updated = await agreementService.respondToProposal({
                agreementId: agreement.id,
                accept: false,
            });
            updateAgreement(updated);

            notificationService.emit({
                type: 'agreement_rejected',
                recipientId: agreement.initiatedBy,
                agreementId: agreement.id,
            });

            addNotification({
                id: `notif_${Date.now()}`,
                type: 'agreement_rejected',
                userId: agreement.initiatedBy,
                title: 'Agreement Rejected',
                message: `${user.username} rejected your agreement "${agreement.title}"`,
                agreementId: agreement.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            addToast({
                type: 'info',
                title: 'Agreement Rejected',
                message: 'You have rejected the proposal.',
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to reject agreement.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // PROPOSAL PENDING STATES
    // ============================================

    // Show proposal actions if pending and user is NOT the initiator
    if (isPending && user && agreement.initiatedBy !== user.id) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Respond to Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Review the agreement details and accept or reject this proposal.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={handleAcceptProposal} loading={isLoading}>
                            <Check className="h-4 w-4 mr-2" />
                            Accept Agreement
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleRejectProposal}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show waiting message if pending and user IS the initiator
    if (isPending && user && agreement.initiatedBy === user.id) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Awaiting Response
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Waiting for the freelancer to accept or reject your proposal.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // ============================================
    // Issue #4: POST-COMPLETION HARD LOCK
    // ============================================
    if (isCompleted) {
        return (
            <Card className="border-emerald-500/50 bg-emerald-500/5">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-emerald-500">
                        <CheckCircle className="h-5 w-5" />
                        Project Completed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        This project has been completed. Escrow funds have been released to the freelancer.
                    </p>
                    {/* Issue #4: NO action buttons - fully read-only */}
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <FileEdit className="h-4 w-4" />
                            This project is now read-only. No changes can be made.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ============================================
    // Issue #5: DISPUTED STATE - Client Override Options
    // ============================================
    if (isDisputed) {
        return (
            <Card className="border-rose-400/50 bg-rose-500/5">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                        Dispute Active
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This agreement is currently under dispute. Escrow funds are frozen.
                    </p>

                    {agreement.dispute?.reason && (
                        <div className="p-3 rounded-lg bg-muted">
                            <span className="font-medium text-sm">Reason:</span>
                            <p className="text-sm text-muted-foreground mt-1">{agreement.dispute.reason}</p>
                        </div>
                    )}

                    {/* Issue #5: CLIENT OVERRIDE OPTIONS */}
                    {isCustomer && (
                        <div className="border-t border-border pt-4">
                            <p className="text-sm font-medium mb-3">Client Override Options</p>
                            <p className="text-xs text-muted-foreground mb-3">
                                As the client, you can resolve this dispute by completing the project or proposing an amendment.
                                The {disputeBond} {agreement.currency} dispute bond will be refunded.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={handleOverrideDispute} loading={isLoading}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete & Release Funds
                                </Button>
                                <Button variant="outline" onClick={handleDisputeAmendment}>
                                    <FileEdit className="h-4 w-4 mr-2" />
                                    Cancel Dispute & Amend
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Freelancer sees read-only dispute info */}
                    {isFreelancer && (
                        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                            <p>Waiting for client to resolve the dispute.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Rejected agreements - no actions
    if (agreement.status === 'proposal_rejected') {
        return null;
    }

    // ============================================
    // ACTIVE PROJECT ACTIONS
    // ============================================
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Completion Status Indicators */}
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 flex items-center gap-3">
                        <div
                            className={cn(
                                'h-8 w-8 rounded-full flex items-center justify-center',
                                agreement.completion.customerApproved
                                    ? 'bg-emerald-500/20 text-emerald-500'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Customer</p>
                            <p className="text-xs text-muted-foreground">
                                {agreement.completion.customerApproved ? 'Approved' : 'Pending'}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                        <div
                            className={cn(
                                'h-8 w-8 rounded-full flex items-center justify-center',
                                agreement.completion.freelancerApproved
                                    ? 'bg-emerald-500/20 text-emerald-500'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Freelancer</p>
                            <p className="text-xs text-muted-foreground">
                                {agreement.completion.freelancerApproved ? 'Approved' : 'Pending'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grace period info */}
                {agreement.timeline.gracePeriodDate && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-500 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                            Grace period ends: {new Date(agreement.timeline.gracePeriodDate).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    {/* 
                     * Issue #3: CUSTOMER ONLY - Propose Amendment 
                     * Freelancer does NOT see this button
                     */}
                    {isCustomer && isActive && (
                        <Button onClick={onOpenAmendment} variant="outline">
                            <FileEdit className="h-4 w-4 mr-2" />
                            Propose Amendment
                        </Button>
                    )}

                    {/* 
                     * Freelancer can submit work (but NOT mark complete)
                     */}
                    {isFreelancer && isActive && !agreement.completion.freelancerApproved && (
                        <Button onClick={handleSubmitWork} variant="outline" loading={isLoading}>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Work
                        </Button>
                    )}

                    {/* 
                     * Issue #3: CUSTOMER ONLY - Mark as Complete
                     * When customer clicks this, project immediately becomes COMPLETED
                     * Freelancer does NOT see this button
                     */}
                    {isCustomer && isActive && (
                        <Button
                            onClick={handleMarkComplete}
                            loading={isLoading}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Complete
                        </Button>
                    )}

                    {/* Raise Dispute - Both roles can see this */}
                    {isActive && (
                        <Button
                            variant="destructive"
                            onClick={onOpenDispute}
                            className="bg-rose-500/90 hover:bg-rose-500"
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Raise Dispute
                        </Button>
                    )}
                </div>

                {/* Dispute fee info */}
                {isActive && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Raising a dispute requires a 5% bond ({disputeBond} {agreement.currency})
                        </p>
                    </div>
                )}

                {/* 
                 * Issue #3: Role-specific guidance
                 */}
                {isFreelancer && isActive && (
                    <div className="p-3 rounded-lg bg-primary/10 text-sm text-muted-foreground">
                        <p>
                            <span className="font-medium text-foreground">Freelancer:</span> Submit your work for review.
                            The customer will mark the project as complete when satisfied.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
