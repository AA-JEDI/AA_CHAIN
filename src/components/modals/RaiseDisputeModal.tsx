'use client';

import * as React from 'react';
import { Agreement } from '@/types';
import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { useUIStore } from '@/state/uiStore';
import { useNotificationStore } from '@/state/notificationStore';
import { agreementService, escrowService, notificationService } from '@/services';
import { getOtherPartyId, getUserRole } from '@/lib/utils';
import { Modal, Button, Textarea, Card } from '@/components/ui';
import { AlertTriangle, Wallet, Info } from 'lucide-react';

interface RaiseDisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    agreement: Agreement;
}

export function RaiseDisputeModal({
    isOpen,
    onClose,
    agreement,
}: RaiseDisputeModalProps) {
    const { user, wallet } = useAuthStore();
    const { updateAgreement } = useAgreementStore();
    const { addToast } = useUIStore();
    const { addNotification } = useNotificationStore();

    const [reason, setReason] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [acknowledged, setAcknowledged] = React.useState(false);

    // Issue #8: Calculate 5% dispute bond
    const disputeBond = escrowService.calculateDisputeBond(agreement.price);
    const userRole = user ? getUserRole(agreement, user.id) : null;

    React.useEffect(() => {
        if (isOpen) {
            setReason('');
            setAcknowledged(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!user || !reason.trim() || !acknowledged) return;

        setIsSubmitting(true);
        try {
            // Issue #15: Call escrow service to freeze funds (raiseDispute)
            await escrowService.freezeFunds(agreement.id);

            // Update agreement with dispute info including bond
            const updated = await agreementService.raiseDispute(agreement.id, reason);

            // Add bond info to the updated agreement
            const updatedWithBond = {
                ...updated,
                dispute: {
                    ...updated.dispute!,
                    bondAmount: disputeBond,
                    bondPaidBy: user.id,
                },
            };

            updateAgreement(updatedWithBond);

            // Issue #13: Notification
            notificationService.emit({
                type: 'dispute_raised',
                recipientId: getOtherPartyId(agreement, user.id),
                agreementId: agreement.id,
                message: `${user.username} raised a dispute on "${agreement.title}"`,
            });

            addNotification({
                id: `notif_${Date.now()}`,
                type: 'dispute_raised',
                userId: getOtherPartyId(agreement, user.id),
                title: 'Dispute Raised',
                message: `${user.username} raised a dispute on "${agreement.title}"`,
                agreementId: agreement.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            addToast({
                type: 'warning',
                title: 'Dispute Raised',
                message: `Escrow funds frozen. ${disputeBond} ${agreement.currency} bond locked.`,
            });

            onClose();
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to raise dispute.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Raise Dispute"
            size="md"
        >
            <div className="space-y-4">
                {/* Warning banner */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-500/10 border border-rose-400/20">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-rose-400">Warning</p>
                        <p className="text-muted-foreground mt-1">
                            Raising a dispute will immediately freeze all escrow funds. This
                            action should only be taken when you believe the agreement terms
                            have been violated.
                        </p>
                    </div>
                </div>

                {/* Issue #8: Dispute fee notice - prominent display */}
                <Card className="p-4 border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-start gap-3">
                        <Wallet className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-amber-500">Dispute Bond Required</p>
                            <p className="text-muted-foreground mt-1">
                                You will temporarily lock <span className="font-semibold text-foreground">5%</span> of the
                                agreement value as a dispute bond.
                            </p>
                            <div className="mt-3 p-3 rounded-lg bg-muted/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Agreement Value:</span>
                                    <span className="font-medium">{agreement.price} {agreement.currency}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-muted-foreground">5% Bond:</span>
                                    <span className="font-semibold text-amber-500">{disputeBond} {agreement.currency}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                The bond will be returned if the dispute resolves in your favor.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Current wallet balance info */}
                {wallet && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            Your wallet balance: <span className="font-medium text-foreground">{parseFloat(wallet.balance).toFixed(4)} ETH</span>
                        </span>
                    </div>
                )}

                <Textarea
                    label="Reason for Dispute"
                    placeholder="Describe the issue in detail. Include any relevant information about why you believe the agreement terms have been violated..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                />

                {/* Acknowledgment checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                        className="mt-1 rounded border-input"
                    />
                    <span className="text-sm text-muted-foreground">
                        I understand that I will lock {disputeBond} {agreement.currency} as a dispute bond,
                        and that this action will freeze all escrow funds until resolution.
                    </span>
                </label>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!reason.trim() || !acknowledged}
                        className="bg-rose-500 hover:bg-rose-600"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Lock Bond & Raise Dispute
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
