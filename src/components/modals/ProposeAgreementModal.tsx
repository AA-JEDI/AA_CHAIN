'use client';

import * as React from 'react';
import { User, CreateProposalDTO } from '@/types';
import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { useUIStore } from '@/state/uiStore';
import { useNotificationStore } from '@/state/notificationStore';
import { agreementService, notificationService, escrowService } from '@/services';
import {
    Modal,
    Button,
    Input,
    Textarea,
    Select,
    Card,
} from '@/components/ui';
import { RoleBadge } from '@/components/agreements';
import { ArrowRight, ArrowLeft, Check, Wallet, AlertCircle } from 'lucide-react';

interface ProposeAgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUser: User | null;
}

// Issue #5: 3-step agreement creation flow
type Step = 'details' | 'terms' | 'review';

export function ProposeAgreementModal({
    isOpen,
    onClose,
    targetUser,
}: ProposeAgreementModalProps) {
    const { user } = useAuthStore();
    const { addAgreement } = useAgreementStore();
    const { addToast } = useUIStore();
    const { addNotification } = useNotificationStore();

    const [step, setStep] = React.useState<Step>('details');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [dateErrors, setDateErrors] = React.useState<{
        startDate?: string;
        endDate?: string;
        gracePeriod?: string;
    }>({});

    // Get today's date in YYYY-MM-DD format for validation
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = React.useState({
        // Step 1: Details
        title: '',
        description: '',
        // Step 2: Terms
        price: '',
        currency: 'ETH',
        startDate: today,
        endDate: '',
        gracePeriodDate: '', // Issue #3: Added grace period
    });

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setStep('details');
            setDateErrors({});
            setFormData({
                title: '',
                description: '',
                price: '',
                currency: 'ETH',
                startDate: today,
                endDate: '',
                gracePeriodDate: '',
            });
        }
    }, [isOpen, today]);

    // Issue #3: Date validation
    const validateDates = (): boolean => {
        const errors: typeof dateErrors = {};
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const gracePeriod = formData.gracePeriodDate ? new Date(formData.gracePeriodDate) : null;

        // Start date cannot be earlier than today
        if (startDate < now) {
            errors.startDate = 'Start date cannot be earlier than today';
        }

        // End date cannot be earlier than start date
        if (endDate < startDate) {
            errors.endDate = 'End date cannot be earlier than start date';
        }

        // Grace period must be after end date
        if (gracePeriod && gracePeriod <= endDate) {
            errors.gracePeriod = 'Grace period must be after the end date';
        }

        setDateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!targetUser || !user) return;

        // Validate dates before submit
        if (!validateDates()) {
            addToast({
                type: 'error',
                title: 'Invalid Dates',
                message: 'Please fix the date validation errors.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const proposal: CreateProposalDTO = {
                targetUserId: targetUser.id,
                initiatorRole: 'customer', // Issue #4: Only customers can create
                title: formData.title,
                description: formData.description,
                price: formData.price,
                currency: formData.currency,
                timeline: {
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    gracePeriodDate: formData.gracePeriodDate || undefined,
                },
            };

            const agreement = await agreementService.createProposal(proposal);
            addAgreement(agreement);

            // Issue #15: Call escrow service to fund escrow (customer deposits)
            await escrowService.fundEscrow(agreement.id, formData.price);

            // Issue #13: Emit notification
            notificationService.emit({
                type: 'agreement_proposal',
                recipientId: targetUser.id,
                agreementId: agreement.id,
                message: `${user.username} wants to work with you on "${formData.title}"`,
            });

            // Add notification to store for immediate UI update
            addNotification({
                id: `notif_${Date.now()}`,
                type: 'agreement_proposal',
                userId: targetUser.id,
                title: 'New Agreement Proposal',
                message: `${user.username} wants to work with you on "${formData.title}"`,
                agreementId: agreement.id,
                read: false,
                createdAt: new Date().toISOString(),
            });

            addToast({
                type: 'success',
                title: 'Proposal Sent',
                message: `Your proposal has been sent to @${targetUser.username}`,
            });

            onClose();
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to create proposal. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validation for each step
    const canProceedFromDetails = formData.title.trim() && formData.description.trim();

    const canProceedFromTerms = () => {
        if (!formData.price || !formData.startDate || !formData.endDate) {
            return false;
        }
        return validateDates();
    };

    if (!targetUser) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Agreement"
            description={`Propose an agreement with @${targetUser.username}`}
            size="lg"
        >
            {/* Step indicator - Issue #5: 3-step flow */}
            <div className="flex items-center gap-2 mb-6">
                {(['details', 'terms', 'review'] as Step[]).map((s, i) => (
                    <React.Fragment key={s}>
                        <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors ${step === s
                                ? 'bg-primary text-primary-foreground'
                                : i < ['details', 'terms', 'review'].indexOf(step)
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {i + 1}
                        </div>
                        {i < 2 && (
                            <div
                                className={`flex-1 h-0.5 ${i < ['details', 'terms', 'review'].indexOf(step)
                                    ? 'bg-primary'
                                    : 'bg-muted'
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step labels */}
            <div className="flex justify-between text-xs text-muted-foreground mb-6 px-2">
                <span className={step === 'details' ? 'text-primary font-medium' : ''}>Details</span>
                <span className={step === 'terms' ? 'text-primary font-medium' : ''}>Terms</span>
                <span className={step === 'review' ? 'text-primary font-medium' : ''}>Review</span>
            </div>

            {/* Step 1: Details - Issue #5 */}
            {step === 'details' && (
                <div className="space-y-4">
                    <Input
                        label="Agreement Title"
                        placeholder="e.g., Website Redesign Project"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    <Textarea
                        label="Description"
                        placeholder="Describe the work to be done, deliverables, and any specific requirements..."
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        rows={5}
                    />

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => setStep('terms')}
                            disabled={!canProceedFromDetails}
                        >
                            Continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Terms - Issue #5 */}
            {step === 'terms' && (
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) =>
                                setFormData({ ...formData, price: e.target.value })
                            }
                        />
                        <Select
                            label="Currency"
                            value={formData.currency}
                            onChange={(e) =>
                                setFormData({ ...formData, currency: e.target.value })
                            }
                            options={[
                                { value: 'ETH', label: 'ETH' },
                                { value: 'USDC', label: 'USDC' },
                                { value: 'DAI', label: 'DAI' },
                            ]}
                        />
                    </div>

                    {/* Issue #3: Date validation */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Input
                                label="Start Date"
                                type="date"
                                min={today}
                                value={formData.startDate}
                                onChange={(e) => {
                                    setFormData({ ...formData, startDate: e.target.value });
                                    setDateErrors({ ...dateErrors, startDate: undefined });
                                }}
                                error={dateErrors.startDate}
                            />
                            {dateErrors.startDate && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {dateErrors.startDate}
                                </p>
                            )}
                        </div>
                        <div>
                            <Input
                                label="End Date"
                                type="date"
                                min={formData.startDate || today}
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
                    </div>

                    {/* Issue #3: Grace period - must be after end date */}
                    <div>
                        <Input
                            label="Grace Period End Date (Optional)"
                            type="date"
                            min={formData.endDate || formData.startDate || today}
                            value={formData.gracePeriodDate}
                            onChange={(e) => {
                                setFormData({ ...formData, gracePeriodDate: e.target.value });
                                setDateErrors({ ...dateErrors, gracePeriod: undefined });
                            }}
                            error={dateErrors.gracePeriod}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Time allowed for the other party to respond after completion is marked
                        </p>
                        {dateErrors.gracePeriod && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {dateErrors.gracePeriod}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setStep('details')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={() => {
                                if (canProceedFromTerms()) {
                                    setStep('review');
                                }
                            }}
                            disabled={!formData.price || !formData.startDate || !formData.endDate}
                        >
                            Review
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Review - Issue #5 */}
            {step === 'review' && (
                <div className="space-y-4">
                    <Card className="p-4 space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Title</p>
                            <p className="font-medium">{formData.title}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="text-sm">{formData.description}</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="font-medium">
                                    {formData.price} {formData.currency}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Your Role</p>
                                <RoleBadge role="customer" />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="font-medium">{formData.startDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">End Date</p>
                                <p className="font-medium">{formData.endDate}</p>
                            </div>
                            {formData.gracePeriodDate && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Grace Period</p>
                                    <p className="font-medium">{formData.gracePeriodDate}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Freelancer</p>
                            <p className="font-medium">@{targetUser.username}</p>
                        </div>
                    </Card>

                    {/* Escrow notice - Customer will fund */}
                    <Card className="p-4 border-primary/50 bg-primary/5">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <Wallet className="h-4 w-4" />
                            <p className="font-medium text-sm">Escrow Required</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You will deposit {formData.price} {formData.currency} into escrow when creating this proposal.
                            Funds will be released to the freelancer upon completion.
                        </p>
                    </Card>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setStep('terms')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button onClick={handleSubmit} loading={isSubmitting}>
                            <Check className="h-4 w-4 mr-2" />
                            Confirm & Propose
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
