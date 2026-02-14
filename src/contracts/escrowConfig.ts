/**
 * Escrow Contract Configuration
 * 
 * This file contains the deployed contract address and ABI
 * for the Escrow smart contract. Update the address after deployment.
 */

// Contract ABI - matches the Solidity contract
export const ESCROW_ABI = [
    // ============ Read Functions ============
    {
        "inputs": [],
        "name": "milestoneCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DISPUTE_FEE_PERCENT",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "milestones",
        "outputs": [
            { "internalType": "address", "name": "client", "type": "address" },
            { "internalType": "address", "name": "worker", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "uint256", "name": "submissionDeadline", "type": "uint256" },
            { "internalType": "uint256", "name": "gracePeriodDeadline", "type": "uint256" },
            { "internalType": "uint256", "name": "reviewPeriodDeadline", "type": "uint256" },
            { "internalType": "uint8", "name": "state", "type": "uint8" },
            { "internalType": "uint256", "name": "disputeFee", "type": "uint256" },
            { "internalType": "address", "name": "disputer", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "settlements",
        "outputs": [
            { "internalType": "address", "name": "proposer", "type": "address" },
            { "internalType": "uint256", "name": "refundAmount", "type": "uint256" },
            { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    // ============ Write Functions ============
    {
        "inputs": [
            { "internalType": "address", "name": "_worker", "type": "address" },
            { "internalType": "uint256", "name": "_submissionDeadline", "type": "uint256" },
            { "internalType": "uint256", "name": "_gracePeriodDeadline", "type": "uint256" },
            { "internalType": "uint256", "name": "_reviewPeriodDeadline", "type": "uint256" }
        ],
        "name": "createMilestone",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }],
        "name": "submitWork",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }],
        "name": "approveWork",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }],
        "name": "refundClient",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }],
        "name": "autoRelease",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }],
        "name": "raiseDispute",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_milestoneId", "type": "uint256" },
            { "internalType": "uint256", "name": "_refundAmount", "type": "uint256" }
        ],
        "name": "proposeSettlement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_milestoneId", "type": "uint256" }],
        "name": "acceptSettlement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // ============ Events ============
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "milestoneId", "type": "uint256" },
            { "indexed": true, "name": "client", "type": "address" },
            { "indexed": true, "name": "worker", "type": "address" },
            { "indexed": false, "name": "amount", "type": "uint256" }
        ],
        "name": "MilestoneCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": true, "name": "milestoneId", "type": "uint256" }],
        "name": "WorkSubmitted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": true, "name": "milestoneId", "type": "uint256" }],
        "name": "WorkApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "milestoneId", "type": "uint256" },
            { "indexed": false, "name": "amount", "type": "uint256" }
        ],
        "name": "ClientRefunded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "milestoneId", "type": "uint256" },
            { "indexed": false, "name": "amount", "type": "uint256" }
        ],
        "name": "FundsAutoReleased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "milestoneId", "type": "uint256" },
            { "indexed": true, "name": "raisedBy", "type": "address" },
            { "indexed": false, "name": "feePaid", "type": "uint256" }
        ],
        "name": "DisputeRaised",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "milestoneId", "type": "uint256" },
            { "indexed": true, "name": "proposer", "type": "address" },
            { "indexed": false, "name": "refundAmount", "type": "uint256" }
        ],
        "name": "SettlementProposed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "milestoneId", "type": "uint256" },
            { "indexed": false, "name": "clientRefund", "type": "uint256" },
            { "indexed": false, "name": "workerPayment", "type": "uint256" }
        ],
        "name": "SettlementAccepted",
        "type": "event"
    }
] as const;

// Milestone Status enum - matches Solidity
export enum MilestoneStatus {
    ACTIVE = 0,
    SUBMITTED = 1,
    DISPUTED = 2,
    RESOLVED = 3,
    CANCELLED = 4,
}

export const STATUS_LABELS: Record<MilestoneStatus, string> = {
    [MilestoneStatus.ACTIVE]: 'Active',
    [MilestoneStatus.SUBMITTED]: 'Submitted',
    [MilestoneStatus.DISPUTED]: 'Disputed',
    [MilestoneStatus.RESOLVED]: 'Resolved',
    [MilestoneStatus.CANCELLED]: 'Cancelled',
};

// Contract addresses by chain ID
// Update this after deploying your contract!
export const ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
    31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Hardhat localhost default
    // Add other networks as needed:
    // 11155111: '0x...', // Sepolia
    // 1: '0x...', // Mainnet
};

// Default to localhost for development
export const DEFAULT_CHAIN_ID = 31337;

// Get contract address for a chain
export function getEscrowAddress(chainId: number): `0x${string}` | undefined {
    return ESCROW_ADDRESSES[chainId];
}

// Dispute fee percentage (matches contract)
export const DISPUTE_FEE_PERCENT = 5n;

// Calculate dispute fee from amount
export function calculateDisputeFee(amountWei: bigint): bigint {
    return (amountWei * DISPUTE_FEE_PERCENT) / 100n;
}
