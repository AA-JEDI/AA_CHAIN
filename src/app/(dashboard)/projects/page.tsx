'use client';

import * as React from 'react';
import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { Tabs, TabsList, TabsTrigger, TabsContent, EmptyState } from '@/components/ui';
import { AgreementCard } from '@/components/agreements';
import { AgreementStatus } from '@/types';

type FilterTab = 'active' | 'completed' | 'disputed' | 'pending';

const TAB_STATUSES: Record<FilterTab, AgreementStatus[]> = {
    pending: ['proposal_pending'],
    active: ['active', 'pending_completion'],
    completed: ['completed'],
    disputed: ['disputed'],
};

export default function ProjectsPage() {
    const { user } = useAuthStore();
    const { agreements } = useAgreementStore();
    const [activeTab, setActiveTab] = React.useState<FilterTab>('active');

    // Filter agreements by current user
    const userAgreements = agreements.filter(
        (a) => a.customer.id === user?.id || a.freelancer.id === user?.id
    );

    // Count by status - always show counts in tabs
    const counts = {
        pending: userAgreements.filter((a) =>
            TAB_STATUSES.pending.includes(a.status)
        ).length,
        active: userAgreements.filter((a) =>
            TAB_STATUSES.active.includes(a.status)
        ).length,
        completed: userAgreements.filter((a) =>
            TAB_STATUSES.completed.includes(a.status)
        ).length,
        disputed: userAgreements.filter((a) =>
            TAB_STATUSES.disputed.includes(a.status)
        ).length,
    };

    // Filtered list
    const filteredAgreements = userAgreements.filter((a) =>
        TAB_STATUSES[activeTab].includes(a.status)
    );

    return (
        <div className="space-y-4 animate-in">
            {/* Single heading - removed duplicate by keeping only one h1 */}
            <div className="mb-2">
                <h1 className="text-2xl font-bold">Projects</h1>
                <p className="text-muted-foreground mt-1">
                    Manage all your agreements in one place
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="pending">
                        Pending
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500">
                            {counts.pending}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        Active
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-500">
                            {counts.active}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-500">
                            {counts.completed}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="disputed">
                        Disputed
                        {/* Issue #10: Using lighter red shade matching "Raise Dispute" button */}
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-400">
                            {counts.disputed}
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    {filteredAgreements.length === 0 ? (
                        <EmptyState
                            icon="folder"
                            title={`No ${activeTab} projects`}
                            description={`You don't have any ${activeTab} projects yet.`}
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredAgreements.map((agreement) => (
                                <AgreementCard key={agreement.id} agreement={agreement} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
