// User Types
export interface User {
    id: string;
    walletAddress: string;
    username: string;
    avatarUrl?: string;
    createdAt: string;
}

export interface UserSummary {
    id: string;
    username: string;
    walletAddress: string;
    avatarUrl?: string;
}

// Role Types
export type UserRole = 'customer' | 'freelancer';

export interface UserRoleContext {
    role: UserRole;
    isCustomer: boolean;
    isFreelancer: boolean;
    canPay: boolean;
    canReceivePayment: boolean;
}

// Agreement Types
export type AgreementStatus =
    | 'proposal_pending'
    | 'proposal_rejected'
    | 'active'
    | 'pending_completion'
    | 'completed'
    | 'disputed';

export interface Timeline {
    startDate: string;
    endDate: string;
    gracePeriodDate?: string; // Added grace period
}

export interface CompletionState {
    customerApproved: boolean;
    freelancerApproved: boolean;
    customerApprovedAt?: string;
    freelancerApprovedAt?: string;
}

export interface DisputeState {
    status: 'none' | 'raised' | 'under_review' | 'resolved';
    raisedBy: UserRole | null;
    raisedAt: string | null;
    reason: string | null;
    bondAmount?: string; // 5% dispute bond
    bondPaidBy?: string; // user id who paid the bond
}

export interface Settlement {
    proposedBy: string;
    customerAmount: string;
    freelancerAmount: string;
    status: 'pending' | 'accepted' | 'rejected';
    proposedAt: string;
}

export interface Agreement {
    id: string;
    title: string;
    description: string;
    customer: UserSummary;
    freelancer: UserSummary;
    price: string;
    currency: string;
    timeline: Timeline;
    status: AgreementStatus;
    escrow: EscrowState;
    completion: CompletionState;
    dispute: DisputeState | null;
    settlement?: Settlement | null;
    initiatedBy: string;
    createdAt: string;
    updatedAt: string;
}

// Escrow Types
export type EscrowStatus = 'unfunded' | 'pending' | 'funded' | 'frozen' | 'released' | 'refunded';

export interface EscrowState {
    status: EscrowStatus;
    amount: string;
    fundedAt?: string | null;
    frozenAt?: string | null;
    releasedAt?: string | null;
    refundedAt?: string | null;
}

// Amendment Types
export type AmendmentStatus =
    | 'pending'
    | 'approved_by_customer'
    | 'approved_by_freelancer'
    | 'approved'
    | 'rejected';

export interface AmendmentChange<T> {
    previous: T;
    proposed: T;
}

export interface AmendmentChanges {
    timeline?: AmendmentChange<Timeline>;
    price?: AmendmentChange<string>;
    description?: AmendmentChange<string>;
}

export interface Amendment {
    id: string;
    agreementId: string;
    proposedBy: string;
    proposedByRole: UserRole; // Added to track role
    status: AmendmentStatus;
    changes: AmendmentChanges;
    reason: string;
    approvals: {
        customer: boolean;
        freelancer: boolean;
    };
    createdAt: string;
}

// Notification Types
export type NotificationType =
    | 'agreement_proposal'
    | 'agreement_accepted'
    | 'agreement_rejected'
    | 'amendment_proposed'
    | 'amendment_approved'
    | 'amendment_rejected'
    | 'completion_approved'
    | 'project_completed'
    | 'dispute_raised'
    | 'settlement_proposed'
    | 'settlement_accepted'
    | 'escrow_funded'
    | 'escrow_released';

export interface Notification {
    id: string;
    type: NotificationType;
    userId: string;
    title: string;
    message: string;
    agreementId?: string;
    amendmentId?: string;
    read: boolean;
    createdAt: string;
}

// Wallet Types
export interface WalletState {
    address: string;
    balance: string;
    connected: boolean;
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'release' | 'refund' | 'dispute_bond';
    amount: string;
    currency: string;
    agreementId: string;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
}

// UI State Types
export interface AsyncState<T> {
    data: T | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

// DTO Types
export interface CreateProposalDTO {
    targetUserId: string;
    initiatorRole: UserRole;
    title: string;
    description: string;
    price: string;
    currency: string;
    timeline: Timeline;
}

export interface ProposalResponseDTO {
    agreementId: string;
    accept: boolean;
}

export interface AmendmentDTO {
    timeline?: Timeline;
    price?: string;
    description?: string;
    reason: string;
}

export interface CreateNotificationDTO {
    type: NotificationType;
    recipientId: string;
    agreementId?: string;
    amendmentId?: string;
    message?: string;
}

// Settlement DTO
export interface SettlementDTO {
    agreementId: string;
    customerAmount: string;
    freelancerAmount: string;
}
