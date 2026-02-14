import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Agreement, UserRole } from '@/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 6): string {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars + 2)}`;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
        return formatDate(dateString);
    } else if (diffDays > 0) {
        return `${diffDays}d ago`;
    } else if (diffHours > 0) {
        return `${diffHours}h ago`;
    } else if (diffMins > 0) {
        return `${diffMins}m ago`;
    } else {
        return 'just now';
    }
}

export function formatCurrency(amount: string, currency = 'ETH'): string {
    return `${amount} ${currency}`;
}

export function getUserRole(agreement: Agreement, userId: string): UserRole | null {
    if (agreement.customer.id === userId) return 'customer';
    if (agreement.freelancer.id === userId) return 'freelancer';
    return null;
}

export function getOtherPartyId(agreement: Agreement, userId: string): string {
    if (agreement.customer.id === userId) return agreement.freelancer.id;
    return agreement.customer.id;
}

export function getOtherParty(
    agreement: Agreement,
    userId: string
): { id: string; username: string; walletAddress: string } {
    if (agreement.customer.id === userId) return agreement.freelancer;
    return agreement.customer;
}

export function hasUserApprovedCompletion(
    agreement: Agreement,
    userId: string
): boolean {
    const role = getUserRole(agreement, userId);
    if (role === 'customer') return agreement.completion.customerApproved;
    if (role === 'freelancer') return agreement.completion.freelancerApproved;
    return false;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Issue #14: Grace period utilities
export function isGracePeriodExpired(agreement: Agreement): boolean {
    if (!agreement.timeline.gracePeriodDate) return false;
    const gracePeriodEnd = new Date(agreement.timeline.gracePeriodDate);
    const now = new Date();
    return now > gracePeriodEnd;
}

export function getGracePeriodStatus(agreement: Agreement): {
    hasGracePeriod: boolean;
    isExpired: boolean;
    remainingDays: number | null;
    autoReleaseRecipient: UserRole | null;
} {
    if (!agreement.timeline.gracePeriodDate) {
        return {
            hasGracePeriod: false,
            isExpired: false,
            remainingDays: null,
            autoReleaseRecipient: null,
        };
    }

    const gracePeriodEnd = new Date(agreement.timeline.gracePeriodDate);
    const now = new Date();
    const isExpired = now > gracePeriodEnd;

    // Calculate remaining days
    const diffMs = gracePeriodEnd.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Determine who gets the funds if grace period expires
    // Issue #14: Auto-resolution logic
    let autoReleaseRecipient: UserRole | null = null;

    if (agreement.status === 'pending_completion') {
        // If freelancer marked complete and customer hasn't responded
        if (agreement.completion.freelancerApproved && !agreement.completion.customerApproved) {
            autoReleaseRecipient = 'freelancer';
        }
        // If customer marked complete and freelancer hasn't responded
        else if (agreement.completion.customerApproved && !agreement.completion.freelancerApproved) {
            autoReleaseRecipient = 'customer';
        }
    }

    return {
        hasGracePeriod: true,
        isExpired,
        remainingDays: isExpired ? 0 : remainingDays,
        autoReleaseRecipient: isExpired ? autoReleaseRecipient : null,
    };
}

// Issue #3: Date validation helpers
export function isDateInFuture(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date >= now;
}

export function isDateAfter(dateString: string, afterDateString: string): boolean {
    const date = new Date(dateString);
    const afterDate = new Date(afterDateString);
    return date > afterDate;
}

export function isDateOnOrAfter(dateString: string, afterDateString: string): boolean {
    const date = new Date(dateString);
    const afterDate = new Date(afterDateString);
    return date >= afterDate;
}

export function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

// Issue #8: Dispute bond calculation
export function calculateDisputeBond(agreementPrice: string): string {
    const price = parseFloat(agreementPrice);
    const bond = price * 0.05;
    return bond.toFixed(4);
}

// Status check helpers
export function isAgreementActive(agreement: Agreement): boolean {
    return agreement.status === 'active' || agreement.status === 'pending_completion';
}

export function isAgreementCompleted(agreement: Agreement): boolean {
    return agreement.status === 'completed';
}

export function isAgreementDisputed(agreement: Agreement): boolean {
    return agreement.status === 'disputed';
}

export function canProposeAmendment(agreement: Agreement, userId: string): boolean {
    // Issue #6: Only customer can propose amendments
    // Issue #7: Only when project is active (not completed/disputed)
    const role = getUserRole(agreement, userId);
    return role === 'customer' && isAgreementActive(agreement);
}

export function canRaiseDispute(agreement: Agreement, userId: string): boolean {
    // Both roles can raise dispute, but only when active
    // Issue #7: Not after completion
    const role = getUserRole(agreement, userId);
    return role !== null && isAgreementActive(agreement);
}
