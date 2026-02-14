export const APP_NAME = 'FreelanceDAO';
export const APP_DESCRIPTION = 'Trustless freelance agreements powered by blockchain escrow';

export const AGREEMENT_STATUS_LABELS = {
    proposal_pending: 'Pending Approval',
    proposal_rejected: 'Rejected',
    active: 'Active',
    pending_completion: 'Awaiting Approval',
    completed: 'Completed',
    disputed: 'Disputed',
} as const;

export const ESCROW_STATUS_LABELS = {
    unfunded: 'Awaiting Funding',
    pending: 'Processing',
    funded: 'Secured in Escrow',
    frozen: 'Frozen',
    released: 'Released',
} as const;

export const AMENDMENT_STATUS_LABELS = {
    pending: 'Pending',
    approved_by_customer: 'Customer Approved',
    approved_by_freelancer: 'Freelancer Approved',
    approved: 'Approved',
    rejected: 'Rejected',
} as const;

export const NOTIFICATION_TYPE_LABELS = {
    agreement_proposal: 'New Proposal',
    agreement_accepted: 'Accepted',
    agreement_rejected: 'Rejected',
    amendment_proposed: 'Amendment',
    amendment_approved: 'Amendment Approved',
    amendment_rejected: 'Amendment Rejected',
    completion_approved: 'Completion',
    dispute_raised: 'Dispute',
    escrow_funded: 'Funded',
    escrow_released: 'Released',
} as const;

export const NAV_ITEMS = [
    { label: 'Home', href: '/home', icon: 'Home' },
    { label: 'Projects', href: '/projects', icon: 'FolderKanban' },
    { label: 'Wallet', href: '/wallet', icon: 'Wallet' },
    { label: 'Notifications', href: '/notifications', icon: 'Bell' },
] as const;

export const SUPPORTED_CURRENCIES = ['ETH', 'USDC', 'DAI'] as const;
