import { Agreement, Amendment } from '@/types';
import { mockUsers } from './users';

export const mockAgreements: Agreement[] = [
    {
        id: 'agreement_001',
        title: 'Website Redesign Project',
        description:
            'Complete redesign of company landing page with modern UI/UX. Includes responsive design, animations, and SEO optimization.',
        customer: {
            id: mockUsers[0].id,
            username: mockUsers[0].username,
            walletAddress: mockUsers[0].walletAddress,
            avatarUrl: mockUsers[0].avatarUrl,
        },
        freelancer: {
            id: mockUsers[1].id,
            username: mockUsers[1].username,
            walletAddress: mockUsers[1].walletAddress,
            avatarUrl: mockUsers[1].avatarUrl,
        },
        price: '0.5',
        currency: 'ETH',
        timeline: {
            startDate: '2024-02-01',
            endDate: '2024-02-28',
        },
        status: 'active',
        escrow: {
            status: 'funded',
            amount: '0.5',
            fundedAt: '2024-02-01T12:00:00Z',
        },
        completion: {
            customerApproved: false,
            freelancerApproved: false,
        },
        dispute: null,
        initiatedBy: mockUsers[0].id,
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-02-01T12:00:00Z',
    },
    {
        id: 'agreement_002',
        title: 'Smart Contract Audit',
        description:
            'Security audit for DeFi protocol smart contracts. Includes vulnerability assessment, gas optimization recommendations, and detailed report.',
        customer: {
            id: mockUsers[0].id,
            username: mockUsers[0].username,
            walletAddress: mockUsers[0].walletAddress,
            avatarUrl: mockUsers[0].avatarUrl,
        },
        freelancer: {
            id: mockUsers[4].id,
            username: mockUsers[4].username,
            walletAddress: mockUsers[4].walletAddress,
            avatarUrl: mockUsers[4].avatarUrl,
        },
        price: '2.0',
        currency: 'ETH',
        timeline: {
            startDate: '2024-01-15',
            endDate: '2024-02-15',
        },
        status: 'completed',
        escrow: {
            status: 'released',
            amount: '2.0',
            fundedAt: '2024-01-15T10:00:00Z',
            releasedAt: '2024-02-14T16:00:00Z',
        },
        completion: {
            customerApproved: true,
            freelancerApproved: true,
        },
        dispute: null,
        initiatedBy: mockUsers[0].id,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-02-14T16:00:00Z',
    },
    {
        id: 'agreement_003',
        title: 'Content Writing for Web3 Blog',
        description:
            'Write 10 blog posts about Web3 topics including DeFi, NFTs, and blockchain technology. Each post should be 1500-2000 words.',
        customer: {
            id: mockUsers[3].id,
            username: mockUsers[3].username,
            walletAddress: mockUsers[3].walletAddress,
            avatarUrl: mockUsers[3].avatarUrl,
        },
        freelancer: {
            id: mockUsers[0].id,
            username: mockUsers[0].username,
            walletAddress: mockUsers[0].walletAddress,
            avatarUrl: mockUsers[0].avatarUrl,
        },
        price: '0.3',
        currency: 'ETH',
        timeline: {
            startDate: '2024-02-10',
            endDate: '2024-03-10',
        },
        status: 'disputed',
        escrow: {
            status: 'frozen',
            amount: '0.3',
            fundedAt: '2024-02-10T08:00:00Z',
            frozenAt: '2024-02-25T14:30:00Z',
        },
        completion: {
            customerApproved: false,
            freelancerApproved: true,
        },
        dispute: {
            status: 'raised',
            raisedBy: 'customer',
            raisedAt: '2024-02-25T14:30:00Z',
            reason: 'Content quality does not meet the agreed standards.',
        },
        initiatedBy: mockUsers[3].id,
        createdAt: '2024-02-05T11:00:00Z',
        updatedAt: '2024-02-25T14:30:00Z',
    },
    {
        id: 'agreement_004',
        title: 'Logo Design for NFT Collection',
        description:
            'Design a unique logo and brand identity for an upcoming NFT collection. Deliverables include logo, color palette, and brand guidelines.',
        customer: {
            id: mockUsers[0].id,
            username: mockUsers[0].username,
            walletAddress: mockUsers[0].walletAddress,
            avatarUrl: mockUsers[0].avatarUrl,
        },
        freelancer: {
            id: mockUsers[1].id,
            username: mockUsers[1].username,
            walletAddress: mockUsers[1].walletAddress,
            avatarUrl: mockUsers[1].avatarUrl,
        },
        price: '0.15',
        currency: 'ETH',
        timeline: {
            startDate: '2024-03-01',
            endDate: '2024-03-15',
        },
        status: 'proposal_pending',
        escrow: {
            status: 'unfunded',
            amount: '0.15',
        },
        completion: {
            customerApproved: false,
            freelancerApproved: false,
        },
        dispute: null,
        initiatedBy: mockUsers[1].id,
        createdAt: '2024-02-28T10:00:00Z',
        updatedAt: '2024-02-28T10:00:00Z',
    },
    {
        id: 'agreement_005',
        title: 'DApp Frontend Development',
        description:
            'Build the frontend for a decentralized application using React, ethers.js, and Web3 wallet integration. Must be responsive and optimized.',
        customer: {
            id: mockUsers[4].id,
            username: mockUsers[4].username,
            walletAddress: mockUsers[4].walletAddress,
            avatarUrl: mockUsers[4].avatarUrl,
        },
        freelancer: {
            id: mockUsers[0].id,
            username: mockUsers[0].username,
            walletAddress: mockUsers[0].walletAddress,
            avatarUrl: mockUsers[0].avatarUrl,
        },
        price: '1.5',
        currency: 'ETH',
        timeline: {
            startDate: '2024-02-20',
            endDate: '2024-04-01',
        },
        status: 'pending_completion',
        escrow: {
            status: 'funded',
            amount: '1.5',
            fundedAt: '2024-02-20T09:00:00Z',
        },
        completion: {
            customerApproved: false,
            freelancerApproved: true,
        },
        dispute: null,
        initiatedBy: mockUsers[4].id,
        createdAt: '2024-02-15T14:00:00Z',
        updatedAt: '2024-03-28T16:00:00Z',
    },
];

export const mockAmendments: Amendment[] = [
    {
        id: 'amendment_001',
        agreementId: 'agreement_001',
        proposedBy: mockUsers[1].id,
        proposedByRole: 'freelancer',
        status: 'pending',
        changes: {
            timeline: {
                previous: { startDate: '2024-02-01', endDate: '2024-02-28' },
                proposed: { startDate: '2024-02-01', endDate: '2024-03-10' },
            },
            price: {
                previous: '0.5',
                proposed: '0.6',
            },
        },
        reason: 'Need additional time for extra features requested during the project.',
        approvals: {
            customer: false,
            freelancer: true,
        },
        createdAt: '2024-02-15T09:00:00Z',
    },
    {
        id: 'amendment_002',
        agreementId: 'agreement_005',
        proposedBy: mockUsers[0].id,
        proposedByRole: 'customer',
        status: 'approved',
        changes: {
            description: {
                previous:
                    'Build the frontend for a decentralized application using React and Web3 wallet integration.',
                proposed:
                    'Build the frontend for a decentralized application using React, ethers.js, and Web3 wallet integration. Must be responsive and optimized.',
            },
        },
        reason: 'Clarified the technology stack and added responsiveness requirement.',
        approvals: {
            customer: true,
            freelancer: true,
        },
        createdAt: '2024-02-18T11:00:00Z',
    },
];

export const getAgreementById = (id: string): Agreement | undefined => {
    return mockAgreements.find((agreement) => agreement.id === id);
};

export const getAgreementsByUserId = (userId: string): Agreement[] => {
    return mockAgreements.filter(
        (agreement) =>
            agreement.customer.id === userId || agreement.freelancer.id === userId
    );
};

export const getAmendmentsByAgreementId = (agreementId: string): Amendment[] => {
    return mockAmendments.filter((amendment) => amendment.agreementId === agreementId);
};
