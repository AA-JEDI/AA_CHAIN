import { WalletState, Transaction } from '@/types';
import { getEthereum, getProvider, getSigner } from '@/lib/web3';
import { ethers } from 'ethers';

export const walletService = {
    async connect(): Promise<WalletState> {
        const ethereum = getEthereum();

        if (!ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            const provider = getProvider();

            if (!provider) {
                throw new Error('Failed to initialize provider');
            }

            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const balance = await provider.getBalance(address);

            return {
                address,
                balance: ethers.formatEther(balance),
                connected: true,
            };
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    },

    async disconnect(): Promise<void> {
        // Metamask doesn't support programmatic disconnection
        // We just clear our local state
        return Promise.resolve();
    },

    async getWallet(): Promise<WalletState | null> {
        const ethereum = getEthereum();
        if (!ethereum || !ethereum.selectedAddress) return null;

        try {
            const provider = getProvider();
            if (!provider) return null;

            const address = ethereum.selectedAddress;
            const balance = await provider.getBalance(address);

            return {
                address,
                balance: ethers.formatEther(balance),
                connected: true
            };
        } catch (error) {
            console.error('Error getting wallet:', error);
            return null;
        }
    },

    async getBalance(address: string): Promise<string> {
        const provider = getProvider();
        if (!provider) return '0';

        try {
            const balance = await provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Get balance error:', error);
            return '0';
        }
    },

    async getTransactions(): Promise<Transaction[]> {
        // In a real app, you would fetch this from an indexer (The Graph) or Etherscan API
        // For now returning empty array or you can keep mocks if you want to see UI data
        return [];
    },

    async signTransaction(txData: {
        to: string;
        amount: string;
        data?: string;
    }): Promise<string> {
        const signer = await getSigner();
        if (!signer) throw new Error('Wallet not connected');

        try {
            const tx = await signer.sendTransaction({
                to: txData.to,
                value: ethers.parseEther(txData.amount),
                data: txData.data
            });
            return tx.hash;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    },
};

