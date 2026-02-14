import { Amendment, AmendmentDTO, UserRole } from '@/types';
import { getAmendmentsByAgreementId } from '@/mock/agreements';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const amendmentService = {
    /**
     * Propose an amendment
     * Issue #6: Only customers can propose amendments (enforced by UI)
     */
    async proposeAmendment(
        agreementId: string,
        amendment: AmendmentDTO,
        proposerRole: UserRole = 'customer' // Default to customer since only customers can propose
    ): Promise<Amendment> {
        await delay(500);
        console.log('[AmendmentService] Proposing amendment:', amendment);

        const newAmendment: Amendment = {
            id: `amendment_${Date.now()}`,
            agreementId,
            proposedBy: 'user_001', // Current user - in real impl, get from auth context
            proposedByRole: proposerRole,
            status: 'pending',
            changes: {
                ...(amendment.timeline && {
                    timeline: {
                        previous: { startDate: '2024-02-01', endDate: '2024-02-28' },
                        proposed: amendment.timeline,
                    },
                }),
                ...(amendment.price && {
                    price: {
                        previous: '0.5',
                        proposed: amendment.price,
                    },
                }),
                ...(amendment.description && {
                    description: {
                        previous: 'Original description',
                        proposed: amendment.description,
                    },
                }),
            },
            reason: amendment.reason,
            approvals: {
                // Customer proposes, so customer auto-approves, freelancer needs to approve
                customer: proposerRole === 'customer',
                freelancer: proposerRole === 'freelancer',
            },
            createdAt: new Date().toISOString(),
        };

        return newAmendment;
    },

    async approveAmendment(amendmentId: string, approverRole: UserRole = 'freelancer'): Promise<Amendment> {
        await delay(500);
        console.log('[AmendmentService] Approving amendment:', amendmentId, 'by', approverRole);

        return {
            id: amendmentId,
            agreementId: 'agreement_001',
            proposedBy: 'user_002',
            proposedByRole: 'customer',
            status: 'approved',
            changes: {},
            reason: 'Amendment approved',
            approvals: {
                customer: true,
                freelancer: true,
            },
            createdAt: new Date().toISOString(),
        };
    },

    async rejectAmendment(amendmentId: string, rejectorRole: UserRole = 'freelancer'): Promise<Amendment> {
        await delay(500);
        console.log('[AmendmentService] Rejecting amendment:', amendmentId, 'by', rejectorRole);

        return {
            id: amendmentId,
            agreementId: 'agreement_001',
            proposedBy: 'user_002',
            proposedByRole: 'customer',
            status: 'rejected',
            changes: {},
            reason: 'Amendment rejected',
            approvals: {
                customer: true,
                freelancer: false,
            },
            createdAt: new Date().toISOString(),
        };
    },

    async getAmendmentHistory(agreementId: string): Promise<Amendment[]> {
        await delay(300);
        return getAmendmentsByAgreementId(agreementId);
    },
};
