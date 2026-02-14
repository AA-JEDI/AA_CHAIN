'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, parseEther } from 'viem';
import {
    useScaffoldAccount,
    useMilestoneCount,
    useMilestone,
    useSettlement,
    useUserRole,
    useCreateMilestone,
    useSubmitWork,
    useApproveWork,
    useRefundClient,
    useAutoRelease,
    useRaiseDispute,
    useProposeSettlement,
    useAcceptSettlement,
    MilestoneStatus,
    calculateDisputeFee,
} from '@/hooks/useEscrowContract';
import { STATUS_LABELS } from '@/contracts/escrowConfig';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '@/components/ui';
import {
    Wallet,
    FileText,
    CheckCircle,
    AlertTriangle,
    Clock,
    Send,
    RefreshCw,
    Gavel,
    Handshake,
} from 'lucide-react';

// ============================================
// MAIN ESCROW PAGE COMPONENT
// ============================================

export default function EscrowPage() {
    const { address, isConnected, contractAddress, isContractAvailable } = useScaffoldAccount();
    const { count: milestoneCount, refetch: refetchCount } = useMilestoneCount();
    const [selectedMilestoneId, setSelectedMilestoneId] = React.useState<bigint | undefined>(undefined);

    // Refresh milestone list periodically
    React.useEffect(() => {
        const interval = setInterval(() => {
            refetchCount();
        }, 5000);
        return () => clearInterval(interval);
    }, [refetchCount]);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Escrow Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Decentralized milestone-based escrow system
                        </p>
                    </div>
                    <ConnectButton />
                </div>

                {/* Connection Status */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-destructive'}`} />
                                <span className="text-sm">
                                    {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected'}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Contract: {isContractAvailable ? contractAddress?.slice(0, 10) + '...' : 'Not Available'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Create Milestone Form */}
                    <CreateMilestoneForm onSuccess={refetchCount} />

                    {/* Milestone List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Milestones ({milestoneCount?.toString() || '0'})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {milestoneCount !== undefined && milestoneCount > 0n ? (
                                <div className="space-y-2">
                                    {Array.from({ length: Number(milestoneCount) }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedMilestoneId(BigInt(i))}
                                            className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedMilestoneId === BigInt(i)
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            Milestone #{i}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No milestones yet. Create one to get started!
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Selected Milestone Details */}
                {selectedMilestoneId !== undefined && (
                    <MilestoneDetails milestoneId={selectedMilestoneId} />
                )}
            </div>
        </div>
    );
}

// ============================================
// CREATE MILESTONE FORM
// ============================================

function CreateMilestoneForm({ onSuccess }: { onSuccess: () => void }) {
    const { isConnected } = useScaffoldAccount();
    const { createMilestone, isPending, isConfirming, isSuccess, error } = useCreateMilestone();

    const [workerAddress, setWorkerAddress] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [submissionDays, setSubmissionDays] = React.useState('7');
    const [graceDays, setGraceDays] = React.useState('1');
    const [reviewDays, setReviewDays] = React.useState('3');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workerAddress || !amount) return;

        const now = BigInt(Math.floor(Date.now() / 1000));
        const submissionDeadline = now + BigInt(parseInt(submissionDays) * 24 * 60 * 60);
        const gracePeriodDeadline = submissionDeadline + BigInt(parseInt(graceDays) * 24 * 60 * 60);
        const reviewPeriodDeadline = submissionDeadline + BigInt(parseInt(reviewDays) * 24 * 60 * 60);

        createMilestone(
            workerAddress as `0x${string}`,
            submissionDeadline,
            gracePeriodDeadline,
            reviewPeriodDeadline,
            amount
        );
    };

    React.useEffect(() => {
        if (isSuccess) {
            onSuccess();
            setWorkerAddress('');
            setAmount('');
        }
    }, [isSuccess, onSuccess]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Create Milestone (Client)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Worker Address"
                        placeholder="0x..."
                        value={workerAddress}
                        onChange={(e) => setWorkerAddress(e.target.value)}
                        disabled={!isConnected}
                    />
                    <Input
                        label="Amount (ETH)"
                        type="number"
                        step="0.01"
                        placeholder="1.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={!isConnected}
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <Input
                            label="Due (days)"
                            type="number"
                            value={submissionDays}
                            onChange={(e) => setSubmissionDays(e.target.value)}
                            disabled={!isConnected}
                        />
                        <Input
                            label="Grace (days)"
                            type="number"
                            value={graceDays}
                            onChange={(e) => setGraceDays(e.target.value)}
                            disabled={!isConnected}
                        />
                        <Input
                            label="Review (days)"
                            type="number"
                            value={reviewDays}
                            onChange={(e) => setReviewDays(e.target.value)}
                            disabled={!isConnected}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!isConnected || isPending || isConfirming || !workerAddress || !amount}
                    >
                        {isPending || isConfirming ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                {isPending ? 'Confirm in MetaMask...' : 'Mining...'}
                            </>
                        ) : (
                            <>
                                <Wallet className="h-4 w-4 mr-2" />
                                Create & Fund Milestone
                            </>
                        )}
                    </Button>

                    {error && (
                        <p className="text-sm text-destructive">{error.message}</p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

// ============================================
// MILESTONE DETAILS COMPONENT
// ============================================

function MilestoneDetails({ milestoneId }: { milestoneId: bigint }) {
    const { milestone, isLoading, refetch } = useMilestone(milestoneId);
    const { settlement } = useSettlement(milestoneId);
    const { isClient, isWorker, isParty } = useUserRole(milestone);
    const { address } = useScaffoldAccount();

    // Refetch on changes
    React.useEffect(() => {
        const interval = setInterval(refetch, 3000);
        return () => clearInterval(interval);
    }, [refetch]);

    if (isLoading || !milestone) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Loading milestone...</p>
                </CardContent>
            </Card>
        );
    }

    const statusColor = {
        [MilestoneStatus.ACTIVE]: 'bg-primary',
        [MilestoneStatus.SUBMITTED]: 'bg-amber-500',
        [MilestoneStatus.DISPUTED]: 'bg-destructive',
        [MilestoneStatus.RESOLVED]: 'bg-emerald-500',
        [MilestoneStatus.CANCELLED]: 'bg-muted',
    }[milestone.state];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Milestone #{milestoneId.toString()}</CardTitle>
                    <Badge className={statusColor}>
                        {STATUS_LABELS[milestone.state]}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Milestone Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Client</p>
                        <p className="font-mono">{milestone.client.slice(0, 10)}...{milestone.client.slice(-6)}</p>
                        {isClient && <Badge variant="outline" className="mt-1">You</Badge>}
                    </div>
                    <div>
                        <p className="text-muted-foreground">Worker</p>
                        <p className="font-mono">{milestone.worker.slice(0, 10)}...{milestone.worker.slice(-6)}</p>
                        {isWorker && <Badge variant="outline" className="mt-1">You</Badge>}
                    </div>
                    <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="text-lg font-bold">{formatEther(milestone.amount)} ETH</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Dispute Fee (5%)</p>
                        <p>{formatEther(calculateDisputeFee(milestone.amount))} ETH</p>
                    </div>
                </div>

                {/* Deadlines */}
                <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Deadlines
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">Submission</p>
                            <p>{new Date(Number(milestone.submissionDeadline) * 1000).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Grace Period</p>
                            <p>{new Date(Number(milestone.gracePeriodDeadline) * 1000).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Review Period</p>
                            <p>{new Date(Number(milestone.reviewPeriodDeadline) * 1000).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Settlement Info (if disputed) */}
                {settlement?.exists && (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <h4 className="font-medium text-amber-500 flex items-center gap-2">
                            <Handshake className="h-4 w-4" />
                            Settlement Proposed
                        </h4>
                        <p className="text-sm mt-2">
                            Refund to Client: {formatEther(settlement.refundAmount)} ETH
                        </p>
                        <p className="text-sm">
                            Payment to Worker: {formatEther(milestone.amount - settlement.refundAmount)} ETH
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <MilestoneActions
                    milestone={milestone}
                    settlement={settlement}
                    onSuccess={refetch}
                />
            </CardContent>
        </Card>
    );
}

// ============================================
// MILESTONE ACTIONS (ROLE & STATE BASED)
// ============================================

interface MilestoneActionsProps {
    milestone: {
        id: bigint;
        client: `0x${string}`;
        worker: `0x${string}`;
        amount: bigint;
        state: MilestoneStatus;
        submissionDeadline: bigint;
        gracePeriodDeadline: bigint;
        reviewPeriodDeadline: bigint;
    };
    settlement?: { proposer: `0x${string}`; refundAmount: bigint; exists: boolean };
    onSuccess: () => void;
}

function MilestoneActions({ milestone, settlement, onSuccess }: MilestoneActionsProps) {
    const { address, isConnected } = useScaffoldAccount();
    const { isClient, isWorker, isParty } = useUserRole(milestone);

    // Hooks for all contract actions
    const submitWork = useSubmitWork();
    const approveWork = useApproveWork();
    const refundClient = useRefundClient();
    const autoRelease = useAutoRelease();
    const raiseDispute = useRaiseDispute();
    const proposeSettlement = useProposeSettlement();
    const acceptSettlement = useAcceptSettlement();

    // Settlement form state
    const [refundPercent, setRefundPercent] = React.useState('50');

    // Check deadlines
    const now = BigInt(Math.floor(Date.now() / 1000));
    const isAfterGracePeriod = now > milestone.gracePeriodDeadline;
    const isAfterReviewPeriod = now > milestone.reviewPeriodDeadline;

    // Can accept settlement (other party than proposer)
    const canAcceptSettlement = settlement?.exists &&
        address?.toLowerCase() !== settlement.proposer.toLowerCase();

    // Refresh on success
    React.useEffect(() => {
        if (submitWork.isSuccess || approveWork.isSuccess || refundClient.isSuccess ||
            autoRelease.isSuccess || raiseDispute.isSuccess || proposeSettlement.isSuccess ||
            acceptSettlement.isSuccess) {
            onSuccess();
        }
    }, [submitWork.isSuccess, approveWork.isSuccess, refundClient.isSuccess,
    autoRelease.isSuccess, raiseDispute.isSuccess, proposeSettlement.isSuccess,
    acceptSettlement.isSuccess, onSuccess]);

    if (!isConnected || !isParty) {
        return (
            <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
                {!isConnected ? 'Connect wallet to interact' : 'You are not a party to this milestone'}
            </div>
        );
    }

    // RESOLVED or CANCELLED - No actions
    if (milestone.state === MilestoneStatus.RESOLVED || milestone.state === MilestoneStatus.CANCELLED) {
        return (
            <div className="p-4 rounded-lg bg-muted/50 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-muted-foreground">This milestone is closed</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="font-medium">Actions</h4>

            <div className="flex flex-wrap gap-3">
                {/* ========== ACTIVE STATE ========== */}
                {milestone.state === MilestoneStatus.ACTIVE && (
                    <>
                        {/* Worker: Submit Work */}
                        {isWorker && (
                            <Button
                                onClick={() => submitWork.submitWork(milestone.id)}
                                disabled={submitWork.isPending || submitWork.isConfirming}
                            >
                                {submitWork.isPending || submitWork.isConfirming ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Submit Work
                            </Button>
                        )}

                        {/* Client: Refund (after grace period) */}
                        {isClient && isAfterGracePeriod && (
                            <Button
                                variant="outline"
                                onClick={() => refundClient.refundClient(milestone.id)}
                                disabled={refundClient.isPending || refundClient.isConfirming}
                            >
                                {refundClient.isPending || refundClient.isConfirming ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Claim Refund
                            </Button>
                        )}

                        {/* Either: Raise Dispute */}
                        <Button
                            variant="destructive"
                            onClick={() => raiseDispute.raiseDispute(milestone.id, milestone.amount)}
                            disabled={raiseDispute.isPending || raiseDispute.isConfirming}
                        >
                            {raiseDispute.isPending || raiseDispute.isConfirming ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 mr-2" />
                            )}
                            Raise Dispute (5% fee)
                        </Button>
                    </>
                )}

                {/* ========== SUBMITTED STATE ========== */}
                {milestone.state === MilestoneStatus.SUBMITTED && (
                    <>
                        {/* Client: Approve Work */}
                        {isClient && (
                            <Button
                                onClick={() => approveWork.approveWork(milestone.id)}
                                disabled={approveWork.isPending || approveWork.isConfirming}
                                className="bg-emerald-500 hover:bg-emerald-600"
                            >
                                {approveWork.isPending || approveWork.isConfirming ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Approve & Release
                            </Button>
                        )}

                        {/* Worker: Auto-release (after review period) */}
                        {isWorker && isAfterReviewPeriod && (
                            <Button
                                onClick={() => autoRelease.autoRelease(milestone.id)}
                                disabled={autoRelease.isPending || autoRelease.isConfirming}
                            >
                                {autoRelease.isPending || autoRelease.isConfirming ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Wallet className="h-4 w-4 mr-2" />
                                )}
                                Auto-Release Funds
                            </Button>
                        )}

                        {/* Client: Raise Dispute */}
                        {isClient && (
                            <Button
                                variant="destructive"
                                onClick={() => raiseDispute.raiseDispute(milestone.id, milestone.amount)}
                                disabled={raiseDispute.isPending || raiseDispute.isConfirming}
                            >
                                {raiseDispute.isPending || raiseDispute.isConfirming ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                )}
                                Dispute Work
                            </Button>
                        )}
                    </>
                )}

                {/* ========== DISPUTED STATE ========== */}
                {milestone.state === MilestoneStatus.DISPUTED && (
                    <>
                        {/* Accept Settlement (other party) */}
                        {canAcceptSettlement && (
                            <Button
                                onClick={() => acceptSettlement.acceptSettlement(milestone.id)}
                                disabled={acceptSettlement.isPending || acceptSettlement.isConfirming}
                                className="bg-emerald-500 hover:bg-emerald-600"
                            >
                                {acceptSettlement.isPending || acceptSettlement.isConfirming ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Handshake className="h-4 w-4 mr-2" />
                                )}
                                Accept Settlement
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Settlement Proposal Form (only in DISPUTED state) */}
            {milestone.state === MilestoneStatus.DISPUTED && (
                <div className="p-4 rounded-lg border border-border space-y-3">
                    <h5 className="font-medium flex items-center gap-2">
                        <Gavel className="h-4 w-4" />
                        Propose Settlement
                    </h5>
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="text-sm text-muted-foreground">Refund to Client (%)</label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={refundPercent}
                                onChange={(e) => setRefundPercent(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => {
                                const refundAmount = (milestone.amount * BigInt(parseInt(refundPercent))) / 100n;
                                proposeSettlement.proposeSettlement(milestone.id, refundAmount);
                            }}
                            disabled={proposeSettlement.isPending || proposeSettlement.isConfirming}
                        >
                            {proposeSettlement.isPending || proposeSettlement.isConfirming ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Gavel className="h-4 w-4 mr-2" />
                            )}
                            Propose
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Client gets: {((Number(refundPercent) / 100) * Number(formatEther(milestone.amount))).toFixed(4)} ETH |
                        Worker gets: {((1 - Number(refundPercent) / 100) * Number(formatEther(milestone.amount))).toFixed(4)} ETH
                    </p>
                </div>
            )}

            {/* Error Messages */}
            {(submitWork.error || approveWork.error || refundClient.error ||
                autoRelease.error || raiseDispute.error || proposeSettlement.error ||
                acceptSettlement.error) && (
                    <p className="text-sm text-destructive">
                        {submitWork.error?.message || approveWork.error?.message ||
                            refundClient.error?.message || autoRelease.error?.message ||
                            raiseDispute.error?.message || proposeSettlement.error?.message ||
                            acceptSettlement.error?.message}
                    </p>
                )}
        </div>
    );
}
