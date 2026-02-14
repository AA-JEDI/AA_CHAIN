import { Notification } from '@/types';

export const mockNotifications: Notification[] = [
    {
        id: 'notif_001',
        type: 'agreement_proposal',
        userId: 'user_001',
        title: 'New Agreement Proposal',
        message: 'bob_designer wants to work with you on "Logo Design for NFT Collection"',
        agreementId: 'agreement_004',
        read: false,
        createdAt: '2024-02-28T10:00:00Z',
    },
    {
        id: 'notif_002',
        type: 'amendment_proposed',
        userId: 'user_001',
        title: 'Amendment Requested',
        message: 'bob_designer proposed changes to timeline and price for "Website Redesign Project"',
        agreementId: 'agreement_001',
        amendmentId: 'amendment_001',
        read: false,
        createdAt: '2024-02-15T09:00:00Z',
    },
    {
        id: 'notif_003',
        type: 'escrow_funded',
        userId: 'user_001',
        title: 'Escrow Funded',
        message: 'evan_blockchain has funded 1.5 ETH into escrow for "DApp Frontend Development"',
        agreementId: 'agreement_005',
        read: true,
        createdAt: '2024-02-20T09:00:00Z',
    },
    {
        id: 'notif_004',
        type: 'completion_approved',
        userId: 'user_001',
        title: 'Work Marked Complete',
        message: 'You marked "DApp Frontend Development" as complete. Waiting for customer approval.',
        agreementId: 'agreement_005',
        read: true,
        createdAt: '2024-03-28T16:00:00Z',
    },
    {
        id: 'notif_005',
        type: 'dispute_raised',
        userId: 'user_001',
        title: 'Dispute Raised',
        message: 'diana_marketer raised a dispute on "Content Writing for Web3 Blog"',
        agreementId: 'agreement_003',
        read: false,
        createdAt: '2024-02-25T14:30:00Z',
    },
    {
        id: 'notif_006',
        type: 'escrow_released',
        userId: 'user_001',
        title: 'Payment Received',
        message: '2.0 ETH has been released to you for "Smart Contract Audit"',
        agreementId: 'agreement_002',
        read: true,
        createdAt: '2024-02-14T16:00:00Z',
    },
    {
        id: 'notif_007',
        type: 'agreement_accepted',
        userId: 'user_001',
        title: 'Agreement Accepted',
        message: 'evan_blockchain accepted your proposal for "Smart Contract Audit"',
        agreementId: 'agreement_002',
        read: true,
        createdAt: '2024-01-14T10:00:00Z',
    },
];

export const getNotificationsByUserId = (userId: string): Notification[] => {
    return mockNotifications
        .filter((notification) => notification.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getUnreadCount = (userId: string): number => {
    return mockNotifications.filter(
        (notification) => notification.userId === userId && !notification.read
    ).length;
};
