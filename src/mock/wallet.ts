import { Transaction, WalletState } from '@/types';

export const mockWallet: WalletState = {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bE2a',
    balance: '4.25',
    connected: true,
};

export const mockTransactions: Transaction[] = [
    {
        id: 'tx_001',
        type: 'deposit',
        amount: '0.5',
        currency: 'ETH',
        agreementId: 'agreement_001',
        timestamp: '2024-02-01T12:00:00Z',
        status: 'confirmed',
    },
    {
        id: 'tx_002',
        type: 'deposit',
        amount: '2.0',
        currency: 'ETH',
        agreementId: 'agreement_002',
        timestamp: '2024-01-15T10:00:00Z',
        status: 'confirmed',
    },
    {
        id: 'tx_003',
        type: 'release',
        amount: '2.0',
        currency: 'ETH',
        agreementId: 'agreement_002',
        timestamp: '2024-02-14T16:00:00Z',
        status: 'confirmed',
    },
    {
        id: 'tx_004',
        type: 'deposit',
        amount: '0.3',
        currency: 'ETH',
        agreementId: 'agreement_003',
        timestamp: '2024-02-10T08:00:00Z',
        status: 'confirmed',
    },
];
