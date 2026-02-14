'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAgreementStore } from '@/state/agreementStore';
import { useAuthStore } from '@/state/authStore';
import { Button, LoadingScreen, Card } from '@/components/ui';
import { AgreementDetailsCard, ProjectActions } from '@/components/agreements';
import { EscrowStatusCard } from '@/components/escrow';
import { AmendmentHistoryList } from '@/components/amendments';
import { ProposeAmendmentModal, RaiseDisputeModal } from '@/components/modals';
import { getUserRole, getGracePeriodStatus, canProposeAmendment, canRaiseDispute } from '@/lib/utils';
import { escrowService } from '@/services';
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { agreements, amendments, updateAgreement } = useAgreementStore();
    const { user } = useAuthStore();

    const [amendmentModalOpen, setAmendmentModalOpen] = React.useState(false);
    const [disputeModalOpen, setDisputeModalOpen] = React.useState(false);

    const agreementId = params.id as string;
    const agreement = agreements.find((a) => a.id === agreementId);
    const agreementAmendments = amendments[agreementId] || [];

    const userRole = agreement && user ? getUserRole(agreement, user.id) : null;

    // Issue #14: Grace period auto-resolution check
    React.useEffect(() => {
        if (!agreement) return;

        const gracePeriodStatus = getGracePeriodStatus(agreement);

        if (gracePeriodStatus.isExpired && gracePeriodStatus.autoReleaseRecipient && agreement.status === 'pending_completion') {
            // Auto-release funds based on who marked complete
            escrowService.autoRelease(agreement.id, gracePeriodStatus.autoReleaseRecipient)
                .then((escrowState) => {
                    updateAgreement({
                        ...agreement,
                        status: 'completed',
                        escrow: escrowState,
                    });
                })
                .catch(console.error);
        }
    }, [agreement, updateAgreement]);

    // Issue #6: Only customer can open amendment modal
    const handleOpenAmendment = () => {
        if (agreement && user && canProposeAmendment(agreement, user.id)) {
            setAmendmentModalOpen(true);
        }
    };

    // Issue #7: Check if dispute can be raised
    const handleOpenDispute = () => {
        if (agreement && user && canRaiseDispute(agreement, user.id)) {
            setDisputeModalOpen(true);
        }
    };

    if (!agreement) {
        return <LoadingScreen message="Loading agreement..." />;
    }

    const gracePeriodStatus = getGracePeriodStatus(agreement);

    return (
        <div className="space-y-4 animate-in">
            {/* Back button */}
            <Button variant="ghost" onClick={() => router.push('/projects')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
            </Button>

            {/* Issue #14: Grace period warning if close to expiry */}
            {gracePeriodStatus.hasGracePeriod && !gracePeriodStatus.isExpired && gracePeriodStatus.remainingDays !== null && gracePeriodStatus.remainingDays <= 3 && (
                <Card className="p-4 border-amber-500/50 bg-amber-500/10">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <div>
                            <p className="font-medium text-amber-500">Grace Period Ending Soon</p>
                            <p className="text-sm text-muted-foreground">
                                {gracePeriodStatus.remainingDays === 0
                                    ? 'Grace period ends today!'
                                    : `${gracePeriodStatus.remainingDays} day${gracePeriodStatus.remainingDays > 1 ? 's' : ''} remaining`
                                }
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Issue #14: Auto-release notice if grace period expired */}
            {gracePeriodStatus.isExpired && gracePeriodStatus.autoReleaseRecipient && agreement.status === 'pending_completion' && (
                <Card className="p-4 border-rose-400/50 bg-rose-500/10">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                        <div>
                            <p className="font-medium text-rose-400">Grace Period Expired</p>
                            <p className="text-sm text-muted-foreground">
                                {gracePeriodStatus.autoReleaseRecipient === 'freelancer'
                                    ? 'Customer did not respond. Funds will be released to freelancer.'
                                    : 'Freelancer did not respond. Funds will be refunded to customer.'
                                }
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-4">
                    <AgreementDetailsCard agreement={agreement} />
                    <ProjectActions
                        agreement={agreement}
                        onOpenAmendment={handleOpenAmendment}
                        onOpenDispute={handleOpenDispute}
                    />
                    <AmendmentHistoryList
                        amendments={agreementAmendments}
                        agreement={agreement}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <EscrowStatusCard
                        escrow={agreement.escrow}
                        currency={agreement.currency}
                    />

                    {/* Role info card */}
                    <Card className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Your Role</p>
                        <p className="font-medium capitalize">{userRole || 'Not a participant'}</p>
                        <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground space-y-1">
                            {userRole === 'customer' && (
                                <>
                                    <p>• You can propose amendments</p>
                                    <p>• You can fund escrow</p>
                                    <p>• You can approve completion</p>
                                </>
                            )}
                            {userRole === 'freelancer' && (
                                <>
                                    <p>• You can submit work</p>
                                    <p>• You can accept/reject proposals</p>
                                    <p>• You can mark as complete</p>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modals - Issue #6: Only shown with proper role checks */}
            <ProposeAmendmentModal
                isOpen={amendmentModalOpen}
                onClose={() => setAmendmentModalOpen(false)}
                agreement={agreement}
            />
            <RaiseDisputeModal
                isOpen={disputeModalOpen}
                onClose={() => setDisputeModalOpen(false)}
                agreement={agreement}
            />
        </div>
    );
}
