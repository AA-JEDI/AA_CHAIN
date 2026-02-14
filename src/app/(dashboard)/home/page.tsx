'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { useAuthStore } from '@/state/authStore';
import { useAgreementStore } from '@/state/agreementStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { UserSearchBar, UserCard } from '@/components/users';
import { AgreementCard } from '@/components/agreements';
import { ProposeAgreementModal } from '@/components/modals';
import { mockUsers } from '@/mock/users';
import { Search, TrendingUp, Users, FileText, Plus, Briefcase, User as UserIcon } from 'lucide-react';

export default function HomePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { agreements } = useAgreementStore();

    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    // Issue #4: Role-based view toggle
    const [currentView, setCurrentView] = React.useState<UserRole>('customer');

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    // Get recent users (excluding current user)
    const recentUsers = mockUsers.filter((u) => u.id !== user?.id).slice(0, 4);

    // Get user's agreements based on current role view
    const roleAgreements = agreements.filter((a) => {
        if (currentView === 'customer') {
            return a.customer.id === user?.id;
        }
        return a.freelancer.id === user?.id;
    });

    // Get user's active agreements for the current role
    const activeAgreements = roleAgreements
        .filter((a) => a.status === 'active' || a.status === 'pending_completion')
        .slice(0, 3);

    // Stats based on all agreements
    const stats = {
        activeAsCustomer: agreements.filter(
            (a) => a.customer.id === user?.id && (a.status === 'active' || a.status === 'pending_completion')
        ).length,
        activeAsFreelancer: agreements.filter(
            (a) => a.freelancer.id === user?.id && (a.status === 'active' || a.status === 'pending_completion')
        ).length,
        completed: agreements.filter(
            (a) =>
                (a.customer.id === user?.id || a.freelancer.id === user?.id) &&
                a.status === 'completed'
        ).length,
        totalValue: agreements
            .filter(
                (a) =>
                    (a.customer.id === user?.id || a.freelancer.id === user?.id) &&
                    (a.status === 'active' || a.status === 'pending_completion')
            )
            .reduce((sum, a) => sum + parseFloat(a.price), 0)
            .toFixed(2),
    };

    const handlePropose = (targetUser: User) => {
        // Issue #4: Only customers can create agreements
        if (currentView !== 'customer') {
            return;
        }
        setSelectedUser(targetUser);
        setIsModalOpen(true);
    };

    const handleNewAgreement = () => {
        // Issue #4: Only customers can create agreements
        if (currentView !== 'customer') {
            return;
        }
        setIsModalOpen(true);
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="space-y-4 animate-in">
            {/* Welcome Section with Role Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome back, <span className="text-gradient">@{user?.username}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {currentView === 'customer'
                            ? 'Find freelancers and create agreements'
                            : 'View and manage your freelance work'}
                    </p>
                </div>

                {/* Role View Toggle - Issue #4 */}
                <div className="flex items-center gap-3">
                    <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as UserRole)}>
                        <TabsList>
                            <TabsTrigger value="customer" className="gap-2">
                                <Briefcase className="h-4 w-4" />
                                Customer
                            </TabsTrigger>
                            <TabsTrigger value="freelancer" className="gap-2">
                                <UserIcon className="h-4 w-4" />
                                Freelancer
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Issue #4: Only show "New Agreement" button in Customer view */}
                    {currentView === 'customer' && (
                        <Button onClick={handleNewAgreement}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Agreement
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {currentView === 'customer' ? stats.activeAsCustomer : stats.activeAsFreelancer}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Active as {currentView === 'customer' ? 'Customer' : 'Freelancer'}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <svg
                                className="h-5 w-5 text-amber-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalValue} ETH</p>
                            <p className="text-sm text-muted-foreground">In Escrow</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Issue #4: Only show User Search in Customer view */}
            {currentView === 'customer' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Find Freelancers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserSearchBar
                            onSelect={handlePropose}
                            excludeUserId={user?.id}
                            placeholder="Search by username or wallet address..."
                        />

                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Suggested Freelancers
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {recentUsers.map((u) => (
                                    <UserCard key={u.id} user={u} onPropose={handlePropose} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Agreements for current role */}
            {activeAgreements.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Active {currentView === 'customer' ? 'Projects' : 'Work'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {activeAgreements.map((agreement) => (
                                <AgreementCard key={agreement.id} agreement={agreement} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Freelancer view info card */}
            {currentView === 'freelancer' && activeAgreements.length === 0 && (
                <Card className="p-6">
                    <div className="text-center">
                        <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Active Freelance Work</h3>
                        <p className="text-muted-foreground">
                            When customers propose agreements to you, they will appear here.
                            Accept proposals to start working on projects.
                        </p>
                    </div>
                </Card>
            )}

            {/* Issue #5: Propose Agreement Modal - only shown in Customer view */}
            {currentView === 'customer' && (
                <ProposeAgreementModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedUser(null);
                    }}
                    targetUser={selectedUser || recentUsers[0]}
                />
            )}
        </div>
    );
}
