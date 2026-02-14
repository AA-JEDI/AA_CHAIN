import { Notification, CreateNotificationDTO, NotificationType } from '@/types';
import { getNotificationsByUserId, getUnreadCount } from '@/mock/notifications';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Notification title templates
const NOTIFICATION_TITLES: Record<NotificationType, string> = {
    agreement_proposal: 'New Agreement Proposal',
    agreement_accepted: 'Agreement Accepted',
    agreement_rejected: 'Agreement Rejected',
    amendment_proposed: 'Amendment Requested',
    amendment_approved: 'Amendment Approved',
    amendment_rejected: 'Amendment Rejected',
    completion_approved: 'Work Marked Complete',
    project_completed: 'Project Completed',
    dispute_raised: 'Dispute Raised',
    settlement_proposed: 'Settlement Proposed',
    settlement_accepted: 'Settlement Accepted',
    escrow_funded: 'Escrow Funded',
    escrow_released: 'Payment Released',
};

// Event listeners for real-time notification updates
type NotificationListener = (notification: Notification) => void;
const listeners: NotificationListener[] = [];

export const notificationService = {
    /**
     * Subscribe to new notifications
     * Returns unsubscribe function
     */
    subscribe(listener: NotificationListener): () => void {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    },

    /**
     * Emit a notification - Issue #13
     * This is called after every action that should trigger a notification:
     * - Agreement proposal sent
     * - Agreement accepted / rejected
     * - Amendment proposed
     * - Amendment approved
     * - Project marked complete
     * - Dispute raised
     * - Settlement accepted
     * - Escrow released
     */
    emit(dto: CreateNotificationDTO): Notification {
        console.log('[NotificationService] Emitting notification:', dto);

        const notification: Notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: dto.type,
            userId: dto.recipientId,
            title: NOTIFICATION_TITLES[dto.type],
            message: dto.message || '',
            agreementId: dto.agreementId,
            amendmentId: dto.amendmentId,
            read: false,
            createdAt: new Date().toISOString(),
        };

        console.log('[NotificationService] Created notification:', notification);

        // Notify all listeners for immediate UI updates
        listeners.forEach(listener => {
            try {
                listener(notification);
            } catch (error) {
                console.error('[NotificationService] Listener error:', error);
            }
        });

        return notification;
    },

    /**
     * Get notifications for a user
     */
    async getNotifications(userId: string): Promise<Notification[]> {
        await delay(300);
        return getNotificationsByUserId(userId);
    },

    /**
     * Get unread count for badge display
     */
    async getUnreadCount(userId: string): Promise<number> {
        await delay(100);
        return getUnreadCount(userId);
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await delay(200);
        console.log('[NotificationService] Marking as read:', notificationId);
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await delay(300);
        console.log('[NotificationService] Marking all as read for:', userId);
    },

    /**
     * Create a notification for a specific event
     * Convenience methods for common notification types
     */
    notifyAgreementProposal(recipientId: string, agreementId: string, senderName: string, title: string): Notification {
        return this.emit({
            type: 'agreement_proposal',
            recipientId,
            agreementId,
            message: `${senderName} wants to work with you on "${title}"`,
        });
    },

    notifyAgreementAccepted(recipientId: string, agreementId: string, responderName: string, title: string): Notification {
        return this.emit({
            type: 'agreement_accepted',
            recipientId,
            agreementId,
            message: `${responderName} accepted your agreement "${title}"`,
        });
    },

    notifyAgreementRejected(recipientId: string, agreementId: string, responderName: string, title: string): Notification {
        return this.emit({
            type: 'agreement_rejected',
            recipientId,
            agreementId,
            message: `${responderName} rejected your agreement "${title}"`,
        });
    },

    notifyAmendmentProposed(recipientId: string, agreementId: string, amendmentId: string, proposerName: string): Notification {
        return this.emit({
            type: 'amendment_proposed',
            recipientId,
            agreementId,
            amendmentId,
            message: `${proposerName} proposed changes to the agreement`,
        });
    },

    notifyAmendmentApproved(recipientId: string, agreementId: string, amendmentId: string): Notification {
        return this.emit({
            type: 'amendment_approved',
            recipientId,
            agreementId,
            amendmentId,
            message: 'Your amendment has been approved',
        });
    },

    notifyCompletionApproved(recipientId: string, agreementId: string, approverName: string, title: string): Notification {
        return this.emit({
            type: 'completion_approved',
            recipientId,
            agreementId,
            message: `${approverName} marked "${title}" as complete`,
        });
    },

    notifyProjectCompleted(recipientId: string, agreementId: string, title: string): Notification {
        return this.emit({
            type: 'project_completed',
            recipientId,
            agreementId,
            message: `Project "${title}" has been completed. Funds released!`,
        });
    },

    notifyDisputeRaised(recipientId: string, agreementId: string, raiserName: string, title: string): Notification {
        return this.emit({
            type: 'dispute_raised',
            recipientId,
            agreementId,
            message: `${raiserName} raised a dispute on "${title}"`,
        });
    },

    notifySettlementProposed(recipientId: string, agreementId: string, proposerName: string): Notification {
        return this.emit({
            type: 'settlement_proposed',
            recipientId,
            agreementId,
            message: `${proposerName} proposed a settlement`,
        });
    },

    notifySettlementAccepted(recipientId: string, agreementId: string): Notification {
        return this.emit({
            type: 'settlement_accepted',
            recipientId,
            agreementId,
            message: 'Settlement has been accepted. Funds will be distributed.',
        });
    },

    notifyEscrowFunded(recipientId: string, agreementId: string, amount: string, currency: string): Notification {
        return this.emit({
            type: 'escrow_funded',
            recipientId,
            agreementId,
            message: `${amount} ${currency} has been deposited into escrow`,
        });
    },

    notifyEscrowReleased(recipientId: string, agreementId: string, amount: string, currency: string): Notification {
        return this.emit({
            type: 'escrow_released',
            recipientId,
            agreementId,
            message: `${amount} ${currency} has been released from escrow`,
        });
    },
};
