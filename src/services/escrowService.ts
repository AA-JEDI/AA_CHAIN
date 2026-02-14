import { EscrowState, UserRole } from '@/types';
import { getAgreementById } from '@/mock/agreements';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Escrow Service - Frontend placeholder calls for smart contract functions
 * 
 * Function Mapping:
 * - createMilestone (fundEscrow) -> Customer only, when accepting agreement
 * - submitWork -> Freelancer only, marks work as submitted
 * - approveWork (releaseFunds) -> Customer only, releases escrow to freelancer
 * - refundClient -> System/dispute resolution, returns funds to customer
 * - autoRelease -> System, triggered by grace period expiry
 * - raiseDispute (freezeFunds) -> Both roles, freezes escrow and locks 5% bond
 * - proposeSettlement -> Both roles during dispute
 * - acceptSettlement -> Both roles during dispute
 */
export const escrowService = {
    /**
     * Get current escrow status
     * Available to: Both roles
     */
    async getStatus(agreementId: string): Promise<EscrowState> {
        await delay(200);
        console.log('[Escrow] Getting escrow status:', agreementId);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        return agreement.escrow;
    },

    /**
     * Fund escrow - Customer deposits funds
     * Role: Customer only
     * Condition: Agreement accepted, escrow unfunded
     * Maps to: createMilestone
     */
    async fundEscrow(agreementId: string, amount: string): Promise<EscrowState> {
        await delay(1000); // Simulate blockchain transaction
        console.log('[Escrow] createMilestone/fundEscrow:', agreementId, amount);

        return {
            status: 'funded',
            amount,
            fundedAt: new Date().toISOString(),
        };
    },

    /**
     * Submit work - Freelancer submits deliverables
     * Role: Freelancer only
     * Condition: Agreement active, escrow funded
     * Maps to: submitWork
     */
    async submitWork(agreementId: string): Promise<{ submitted: boolean; submittedAt: string }> {
        await delay(500);
        console.log('[Escrow] submitWork:', agreementId);

        return {
            submitted: true,
            submittedAt: new Date().toISOString(),
        };
    },

    /**
     * Approve work and release funds - Customer approves and releases to freelancer
     * Role: Customer only
     * Condition: Work submitted, escrow funded
     * Maps to: approveWork
     */
    async releaseFunds(agreementId: string): Promise<EscrowState> {
        await delay(1000); // Simulate blockchain transaction
        console.log('[Escrow] approveWork/releaseFunds:', agreementId);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        return {
            status: 'released',
            amount: agreement.escrow.amount,
            fundedAt: agreement.escrow.fundedAt,
            releasedAt: new Date().toISOString(),
        };
    },

    /**
     * Refund client - Returns funds to customer
     * Role: System/Dispute resolution
     * Condition: Dispute resolved in customer's favor or auto-refund
     * Maps to: refundClient
     */
    async refundClient(agreementId: string): Promise<EscrowState> {
        await delay(1000);
        console.log('[Escrow] refundClient:', agreementId);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        return {
            status: 'refunded',
            amount: agreement.escrow.amount,
            fundedAt: agreement.escrow.fundedAt,
            refundedAt: new Date().toISOString(),
        };
    },

    /**
     * Auto-release funds - Triggered when grace period expires
     * Role: System (automated)
     * Condition: Grace period expired without response
     * Maps to: autoRelease
     */
    async autoRelease(agreementId: string, toRole: UserRole): Promise<EscrowState> {
        await delay(1000);
        console.log('[Escrow] autoRelease:', agreementId, 'to:', toRole);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        // If grace period expires and other party hasn't responded:
        // - Freelancer marked complete, customer didn't respond -> release to freelancer
        // - Customer marked complete, freelancer didn't respond -> refund to customer
        return {
            status: toRole === 'freelancer' ? 'released' : 'refunded',
            amount: agreement.escrow.amount,
            fundedAt: agreement.escrow.fundedAt,
            releasedAt: toRole === 'freelancer' ? new Date().toISOString() : undefined,
            refundedAt: toRole === 'customer' ? new Date().toISOString() : undefined,
        };
    },

    /**
     * Freeze funds for dispute
     * Role: Both (whoever raises dispute)
     * Condition: Agreement active, no existing dispute
     * Maps to: raiseDispute
     * Note: Caller must pay 5% bond
     */
    async freezeFunds(agreementId: string): Promise<EscrowState> {
        await delay(500);
        console.log('[Escrow] raiseDispute/freezeFunds:', agreementId);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        return {
            status: 'frozen',
            amount: agreement.escrow.amount,
            fundedAt: agreement.escrow.fundedAt,
            frozenAt: new Date().toISOString(),
        };
    },

    /**
     * Propose settlement during dispute
     * Role: Both roles
     * Condition: Dispute active
     * Maps to: proposeSettlement
     */
    async proposeSettlement(
        agreementId: string,
        customerAmount: string,
        freelancerAmount: string
    ): Promise<{ proposed: boolean; proposedAt: string }> {
        await delay(500);
        console.log('[Escrow] proposeSettlement:', agreementId, { customerAmount, freelancerAmount });

        return {
            proposed: true,
            proposedAt: new Date().toISOString(),
        };
    },

    /**
     * Accept settlement
     * Role: The other party (not the one who proposed)
     * Condition: Settlement proposed
     * Maps to: acceptSettlement
     */
    async acceptSettlement(agreementId: string): Promise<EscrowState> {
        await delay(1000);
        console.log('[Escrow] acceptSettlement:', agreementId);

        const agreement = getAgreementById(agreementId);
        if (!agreement) {
            throw new Error('Agreement not found');
        }

        return {
            status: 'released',
            amount: agreement.escrow.amount,
            fundedAt: agreement.escrow.fundedAt,
            releasedAt: new Date().toISOString(),
        };
    },

    /**
     * Calculate dispute bond (5% of agreement value)
     * Utility function for UI display
     */
    calculateDisputeBond(agreementPrice: string): string {
        const price = parseFloat(agreementPrice);
        const bond = price * 0.05;
        return bond.toFixed(4);
    },
};
