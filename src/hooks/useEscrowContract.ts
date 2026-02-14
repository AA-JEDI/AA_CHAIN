'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ESCROW_ABI, getEscrowAddress, MilestoneStatus, calculateDisputeFee } from '@/contracts/escrowConfig';

// ============================================
// TYPES
// ============================================

export interface Milestone {
    id: bigint;
    client: `0x${string}`;
    worker: `0x${string}`;
    amount: bigint;
    submissionDeadline: bigint;
    gracePeriodDeadline: bigint;
    reviewPeriodDeadline: bigint;
    state: MilestoneStatus;
    disputeFee: bigint;
    disputer: `0x${string}`;
}

export interface Settlement {
    proposer: `0x${string}`;
    refundAmount: bigint;
    exists: boolean;
}

// ============================================
// CORE ACCOUNT HOOK
// ============================================

/**
 * Hook to get connected wallet info
 * Mimics Scaffold-ETH's useScaffoldAccount
 */
export function useScaffoldAccount() {
    const { address, isConnected, isConnecting } = useAccount();
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);

    return {
        address,
        isConnected,
        isConnecting,
        chainId,
        contractAddress,
        isContractAvailable: !!contractAddress,
    };
}

// ============================================
// READ HOOKS
// ============================================

/**
 * Read milestone count from contract
 */
export function useMilestoneCount() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);

    const { data, isLoading, refetch } = useReadContract({
        address: contractAddress,
        abi: ESCROW_ABI,
        functionName: 'milestoneCount',
    });

    return {
        count: data as bigint | undefined,
        isLoading,
        refetch,
    };
}

/**
 * Read a single milestone by ID
 */
export function useMilestone(milestoneId: bigint | undefined) {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);

    const { data, isLoading, refetch, error } = useReadContract({
        address: contractAddress,
        abi: ESCROW_ABI,
        functionName: 'milestones',
        args: milestoneId !== undefined ? [milestoneId] : undefined,
        query: {
            enabled: milestoneId !== undefined,
        },
    });

    // Parse the tuple response into structured object
    const milestone: Milestone | undefined = data ? {
        id: milestoneId!,
        client: (data as any)[0],
        worker: (data as any)[1],
        amount: (data as any)[2],
        submissionDeadline: (data as any)[3],
        gracePeriodDeadline: (data as any)[4],
        reviewPeriodDeadline: (data as any)[5],
        state: (data as any)[6] as MilestoneStatus,
        disputeFee: (data as any)[7],
        disputer: (data as any)[8],
    } : undefined;

    return {
        milestone,
        isLoading,
        refetch,
        error,
    };
}

/**
 * Read settlement for a milestone
 */
export function useSettlement(milestoneId: bigint | undefined) {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);

    const { data, isLoading, refetch } = useReadContract({
        address: contractAddress,
        abi: ESCROW_ABI,
        functionName: 'settlements',
        args: milestoneId !== undefined ? [milestoneId] : undefined,
        query: {
            enabled: milestoneId !== undefined,
        },
    });

    const settlement: Settlement | undefined = data ? {
        proposer: (data as any)[0],
        refundAmount: (data as any)[1],
        exists: (data as any)[2],
    } : undefined;

    return {
        settlement,
        isLoading,
        refetch,
    };
}

// ============================================
// WRITE HOOKS (Trigger MetaMask)
// ============================================

/**
 * Create a new milestone (Client only, payable)
 */
export function useCreateMilestone() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const createMilestone = async (
        workerAddress: `0x${string}`,
        submissionDeadline: bigint,
        gracePeriodDeadline: bigint,
        reviewPeriodDeadline: bigint,
        amountEth: string
    ) => {
        console.log('[useCreateMilestone] Creating milestone...', {
            workerAddress,
            submissionDeadline,
            gracePeriodDeadline,
            reviewPeriodDeadline,
            amountEth,
        });

        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'createMilestone',
            args: [workerAddress, submissionDeadline, gracePeriodDeadline, reviewPeriodDeadline],
            value: parseEther(amountEth),
        });
    };

    return {
        createMilestone,
        isPending,
        isConfirming,
        isSuccess,
        hash,
        error,
    };
}

/**
 * Submit work (Worker only)
 */
export function useSubmitWork() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const submitWork = (milestoneId: bigint) => {
        console.log('[useSubmitWork] Submitting work for milestone:', milestoneId.toString());
        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'submitWork',
            args: [milestoneId],
        });
    };

    return { submitWork, isPending, isConfirming, isSuccess, hash, error };
}

/**
 * Approve work (Client only)
 */
export function useApproveWork() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const approveWork = (milestoneId: bigint) => {
        console.log('[useApproveWork] Approving work for milestone:', milestoneId.toString());
        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'approveWork',
            args: [milestoneId],
        });
    };

    return { approveWork, isPending, isConfirming, isSuccess, hash, error };
}

/**
 * Refund client (Client only, after grace period)
 */
export function useRefundClient() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const refundClient = (milestoneId: bigint) => {
        console.log('[useRefundClient] Requesting refund for milestone:', milestoneId.toString());
        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'refundClient',
            args: [milestoneId],
        });
    };

    return { refundClient, isPending, isConfirming, isSuccess, hash, error };
}

/**
 * Auto-release funds (Worker only, after review period)
 */
export function useAutoRelease() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const autoRelease = (milestoneId: bigint) => {
        console.log('[useAutoRelease] Auto-releasing funds for milestone:', milestoneId.toString());
        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'autoRelease',
            args: [milestoneId],
        });
    };

    return { autoRelease, isPending, isConfirming, isSuccess, hash, error };
}

/**
 * Raise dispute (Either party, payable - requires 5% fee)
 */
export function useRaiseDispute() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const raiseDispute = (milestoneId: bigint, milestoneAmount: bigint) => {
        const disputeFee = calculateDisputeFee(milestoneAmount);
        console.log('[useRaiseDispute] Raising dispute for milestone:', milestoneId.toString(), 'fee:', formatEther(disputeFee));

        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'raiseDispute',
            args: [milestoneId],
            value: disputeFee,
        });
    };

    return { raiseDispute, isPending, isConfirming, isSuccess, hash, error };
}

/**
 * Propose settlement (Either party in dispute)
 */
export function useProposeSettlement() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const proposeSettlement = (milestoneId: bigint, refundAmountWei: bigint) => {
        console.log('[useProposeSettlement] Proposing settlement:', milestoneId.toString(), 'refund:', formatEther(refundAmountWei));
        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'proposeSettlement',
            args: [milestoneId, refundAmountWei],
        });
    };

    return { proposeSettlement, isPending, isConfirming, isSuccess, hash, error };
}

/**
 * Accept settlement (Other party)
 */
export function useAcceptSettlement() {
    const chainId = useChainId();
    const contractAddress = getEscrowAddress(chainId);
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const acceptSettlement = (milestoneId: bigint) => {
        console.log('[useAcceptSettlement] Accepting settlement for milestone:', milestoneId.toString());
        writeContract({
            address: contractAddress!,
            abi: ESCROW_ABI,
            functionName: 'acceptSettlement',
            args: [milestoneId],
        });
    };

    return { acceptSettlement, isPending, isConfirming, isSuccess, hash, error };
}

// ============================================
// ROLE HELPERS
// ============================================

/**
 * Determine user's role in a milestone
 * Only needs client and worker addresses
 */
export function useUserRole(milestone: { client: `0x${string}`; worker: `0x${string}` } | undefined) {
    const { address } = useAccount();

    if (!milestone || !address) {
        return { isClient: false, isWorker: false, isParty: false };
    }

    const isClient = address.toLowerCase() === milestone.client.toLowerCase();
    const isWorker = address.toLowerCase() === milestone.worker.toLowerCase();

    return {
        isClient,
        isWorker,
        isParty: isClient || isWorker,
    };
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { MilestoneStatus, calculateDisputeFee };
export { formatEther, parseEther };
