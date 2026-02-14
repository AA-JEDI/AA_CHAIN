import { Agreement, CreateProposalDTO, ProposalResponseDTO, UserSummary } from '@/types';
import {
    mockAgreements,
    getAgreementById,
    getAgreementsByUserId,
} from '@/mock/agreements';
import { getUserById, currentUser } from '@/mock/users';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Issue #6 Fix: Helper to get proper UserSummary from user ID
 * Returns actual user data instead of placeholder 'target_user'
 */
const getUserSummary = (userId: string): UserSummary => {
    const user = getUserById(userId);
    if (user) {
        return {
            id: user.id,
            username: user.username,
            walletAddress: user.walletAddress,
            avatarUrl: user.avatarUrl,
        };
    }
    // Fallback - should not happen if userId is valid
    return {
        id: userId,
        username: `user_${userId.slice(-4)}`,
        walletAddress: '0x...',
    };
};

/**
 * Get current user summary (the logged-in user)
 */
const getCurrentUserSummary = (): UserSummary => {
    return {
        id: currentUser.id,
        username: currentUser.username,
        walletAddress: currentUser.walletAddress,
        avatarUrl: currentUser.avatarUrl,
    };
};

export const agreementService = {
    async createProposal(proposal: CreateProposalDTO): Promise<Agreement> {
        await delay(500);
        console.log('[AgreementService] Creating proposal:', proposal);

        const currentUserSummary = getCurrentUserSummary();

        /**
         * Issue #6 Fix: Use actual user data for target user
         * - If initiator is customer -> they become customer, target is freelancer
         * - If initiator is freelancer -> they become freelancer, target is customer
         */
        const targetUserSummary = getUserSummary(proposal.targetUserId);

        const newAgreement: Agreement = {
            id: `agreement_${Date.now()}`,
            title: proposal.title,
            description: proposal.description,
            // Issue #6: Properly assign user data based on role
            customer: proposal.initiatorRole === 'customer'
                ? currentUserSummary
                : targetUserSummary,
            freelancer: proposal.initiatorRole === 'freelancer'
                ? currentUserSummary
                : targetUserSummary,
            price: proposal.price,
            currency: proposal.currency,
            timeline: proposal.timeline,
            status: 'proposal_pending',
            escrow: {
                status: proposal.initiatorRole === 'customer' ? 'funded' : 'unfunded',
                amount: proposal.price,
                fundedAt: proposal.initiatorRole === 'customer' ? new Date().toISOString() : undefined,
            },
            completion: {
                customerApproved: false,
                freelancerApproved: false,
            },
            dispute: null,
            initiatedBy: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        console.log('[AgreementService] Created agreement with customer:', newAgreement.customer.username, 'freelancer:', newAgreement.freelancer.username);
        return newAgreement;
    },

    async respondToProposal(response: ProposalResponseDTO): Promise<Agreement> {
        await delay(500);
        console.log('[AgreementService] Responding to proposal:', response);

        const agreement = getAgreementById(response.agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        return {
            ...agreement,
            status: response.accept ? 'active' : 'proposal_rejected',
            escrow: response.accept
                ? { ...agreement.escrow, status: 'funded', fundedAt: new Date().toISOString() }
                : agreement.escrow,
            updatedAt: new Date().toISOString(),
        };
    },

    async getAgreements(userId: string): Promise<Agreement[]> {
        await delay(300);
        return getAgreementsByUserId(userId);
    },

    async getAgreementById(id: string): Promise<Agreement | undefined> {
        await delay(200);
        return getAgreementById(id);
    },

    async raiseDispute(agreementId: string, reason: string): Promise<Agreement> {
        await delay(500);
        console.log('[AgreementService] Raising dispute:', agreementId, reason);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        return {
            ...agreement,
            status: 'disputed',
            escrow: {
                ...agreement.escrow,
                status: 'frozen',
                frozenAt: new Date().toISOString(),
            },
            dispute: {
                status: 'raised',
                raisedBy: 'customer', // Would be determined by current user context
                raisedAt: new Date().toISOString(),
                reason,
            },
            updatedAt: new Date().toISOString(),
        };
    },

    /**
     * Issue #3 Fix: Only customer marks complete
     * When customer marks complete, project is immediately DONE
     */
    async markComplete(agreementId: string, userId: string): Promise<Agreement> {
        await delay(500);
        console.log('[AgreementService] Marking complete:', agreementId, userId);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        const isCustomer = agreement.customer.id === userId;

        // Issue #3: Only customer can mark complete
        if (!isCustomer) {
            throw new Error('Only customer can mark project as complete');
        }

        // When customer marks complete, project is done immediately
        return {
            ...agreement,
            status: 'completed',
            completion: {
                customerApproved: true,
                freelancerApproved: true, // Auto-set when customer completes
            },
            escrow: {
                ...agreement.escrow,
                status: 'released',
                releasedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
        };
    },
};
