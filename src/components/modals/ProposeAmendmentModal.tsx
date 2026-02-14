'use client';

import * as React from 'react';
import { Agreement, AmendmentDTO } from '@/types';
import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { useUIStore } from '@/state/uiStore';
import { useNotificationStore } from '@/state/notificationStore';
import { amendmentService, notificationService } from '@/services';
import { getUserRole, getOtherPartyId } from '@/lib/utils';
import { Modal, Button, Input, Textarea, Card } from '@/components/ui';
import { AlertCircle, FileEdit } from 'lucide-react';

interface ProposeAmendmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agreement: Agreement;
}

export function ProposeAmendmentModal({
    isOpen,
    onClose,
    agreement,
}: ProposeAmendmentModalProps) {
    const { user } = useAuthStore();
    const { addAmendment } = useAgreementStore();
    const { addToast } = useUIStore();
    const { addNotification } = useNotificationStore();

    const userRole = user ? getUserRole(agreement, user.id) : null;
    const today = new Date().toISOString().split('T')[0];

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [dateErrors, setDateErrors] = React.useState<{
        endDate?: string;
        gracePeriod?: string;
    }>({});
    const [formData, setFormData] = React.useState({
        price: agreement.price,
        endDate: agreement.timeline.endDate,
        gracePeriodDate: agreement.timeline.gracePeriodDate || '',
        description: agreement.description,
        reason: '',
        modifyPrice: false,
        modifyTimeline: false,
        modifyDescription: false,
    });

    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                price: agreement.price,
                endDate: agreement.timeline.endDate,
                gracePeriodDate: agreement.timeline.gracePeriodDate || '',
                description: agreement.description,
                reason: '',
                modifyPrice: false,
                modifyTimeline: false,
                modifyDescription: false,
            });
            setDateErrors({});
        }
    }, [isOpen, agreement]);

    // Issue #6: Only customers can propose amendments
    // This should never render for freelancers, but adding safety check
    if (userRole === 'freelancer') {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Cannot Propose Amendment"
                size="sm"
            >
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-muted-foreground">
                        Only the customer can propose amendments to this agreement.
                    </p>
                </div>
                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </Modal>
        );
    }

    // Issue #3: Date validation for amendments
    const validateDates = (): boolean => {
        const errors: typeof dateErrors = {};
        const startDate = new Date(agreement.timeline.startDate);
        const endDate = new Date(formData.endDate);
        const gracePeriod = formData.gracePeriodDate ? new Date(formData.gracePeriodDate) : null;

        // End date cannot be earlier than start date
        if (formData.modifyTimeline && endDate < startDate) {
            errors.endDate = 'End date cannot be earlier than start date';
        }

        // Grace period must be after end date
        if (formData.modifyTimeline && gracePeriod && gracePeriod <= endDate) {
            errors.gracePeriod = 'Grace period must be after the end date';
        }

        setDateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!user) return;

        // Validate dates first
        if (formData.modifyTimeline && !validateDates()) {
            addToast({
                type: 'error',
                title: 'Invalid Dates',
                message: 'Please fix the date validation errors.',
            });
            return;
        }

        const amendment: AmendmentDTO = {
            reason: formData.reason,
        };

        if (formData.modifyTimeline && formData.endDate !== agreement.timeline.endDate) {
            amendment.timeline = {
                startDate: agreement.timeline.startDate,
                endDate: formData.endDate,
                gracePeriodDate: formData.gracePeriodDate || undefined,
            };
        }

        if (formData.modifyPrice && formData.price !== agreement.price) {
            amendment.price = formData.price;
        }

        if (formData.modifyDescription && formData.description !== agreement.description) {
            amendment.description = formData.description;
        }

        if (!amendment.timeline && !amendment.price && !amendment.description) {
            addToast({
                type: 'warning',
                title: 'No Changes',
                message: 'Please modify at least one field.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await amendmentService.proposeAmendment(
                agreement.id,
                amendment
            );

            // Add role info to the created amendment
            const amendmentWithRole = {
                ...created,
                proposedByRole: 'customer' as const,
            };

            addAmendment(amendmentWithRole);

            // Issue #13: Notification
            notificationService.emit({
                type: 'amendment_proposed',
                recipientId: getOtherPartyId(agreement, user.id),
                agreementId: agreement.id,
                amendmentId: created.id,
            });

            addNotification({
                id: `notif_${Date.now()}`,
                type: 'amendment_proposed',
                userId: getOtherPartyId(agreement, user.id),
                title: 'Amendment Proposed',
                message: `${user.username} proposed changes to "${agreement.title}"`,
                agreementId: agreement.id,
                amendmentId: created.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            addToast({
                type: 'success',
                title: 'Amendment Proposed',
                message: 'The freelancer will be notified to review your changes.',
            });

            onClose();
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to propose amendment.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Propose Amendment"
            description="Request changes to the agreement terms. The freelancer must approve."
            size="lg"
        >
            <div className="space-y-4">
                {/* Info card */}
                <Card className="p-4 border-primary/30 bg-primary/5">
                    <div className="flex items-start gap-2">
                        <FileEdit className="h-4 w-4 text-primary mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                            As the customer, you can propose changes to the agreement terms.
                            The freelancer must approve these changes for them to take effect.
                        </p>
                    </div>
                </Card>

                {/* Timeline */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.modifyTimeline}
                            onChange={(e) =>
                                setFormData({ ...formData, modifyTimeline: e.target.checked })
                            }
                            className="rounded border-input"
                        />
                        <span className="text-sm font-medium">Modify Timeline</span>
                    </label>
                    {formData.modifyTimeline && (
                        <div className="pl-6 space-y-3">
                            <div>
                                <Input
                                    label="End Date"
                                    type="date"
                                    min={agreement.timeline.startDate}
                                    value={formData.endDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, endDate: e.target.value });
                                        setDateErrors({ ...dateErrors, endDate: undefined });
                                    }}
                                    error={dateErrors.endDate}
                                />
                                {dateErrors.endDate && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {dateErrors.endDate}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Input
                                    label="Grace Period End Date (Optional)"
                                    type="date"
                                    min={formData.endDate}
                                    value={formData.gracePeriodDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, gracePeriodDate: e.target.value });
                                        setDateErrors({ ...dateErrors, gracePeriod: undefined });
                                    }}
                                    error={dateErrors.gracePeriod}
                                />
                                {dateErrors.gracePeriod && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {dateErrors.gracePeriod}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.modifyPrice}
                            onChange={(e) =>
                                setFormData({ ...formData, modifyPrice: e.target.checked })
                            }
                            className="rounded border-input"
                        />
                        <span className="text-sm font-medium">Modify Price</span>
                    </label>
                    {formData.modifyPrice && (
                        <div className="pl-6">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({ ...formData, price: e.target.value })
                                }
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Current: {agreement.price} {agreement.currency}
                            </p>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.modifyDescription}
                            onChange={(e) =>
                                setFormData({ ...formData, modifyDescription: e.target.checked })
                            }
                            className="rounded border-input"
                        />
                        <span className="text-sm font-medium">Modify Description</span>
                    </label>
                    {formData.modifyDescription && (
                        <div className="pl-6">
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={4}
                            />
                        </div>
                    )}
                </div>

                {/* Reason */}
                <Textarea
                    label="Reason for Amendment"
                    placeholder="Explain why you are requesting these changes..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!formData.reason}
                    >
                        Submit Amendment
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
