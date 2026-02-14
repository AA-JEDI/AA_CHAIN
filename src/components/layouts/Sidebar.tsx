'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn, formatAddress } from '@/lib/utils';
import { useAuthStore } from '@/state/authStore';
import { useNotificationStore } from '@/state/notificationStore';
import { useUIStore } from '@/state/uiStore';
import { Avatar, Button } from '@/components/ui';
import {
    Home,
    FolderKanban,
    Wallet,
    Bell,
    LogOut,
    ChevronLeft,
    Shield,
} from 'lucide-react';

const navItems = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Escrow', href: '/escrow', icon: Shield },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
    { label: 'Notifications', href: '/notifications', icon: Bell },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, wallet, disconnectWallet } = useAuthStore();
    const { unreadCount } = useNotificationStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();

    const handleLogout = () => {
        disconnectWallet();
        router.push('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* 
             * Sidebar - ALWAYS fixed position
             * Issue #2 Fix: Removed 'lg:relative' - sidebar stays fixed on all screen sizes
             * Main content uses margin-left to offset correctly
             */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-all duration-300 flex flex-col',
                    sidebarOpen ? 'w-64' : 'w-20',
                    // Mobile: translate off-screen when closed
                    !sidebarOpen && '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <Link href="/home" className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                            <span className="text-xl font-bold text-white">F</span>
                        </div>
                        {sidebarOpen && (
                            <span className="text-lg font-bold text-gradient">FreelanceDAO</span>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="hidden lg:flex"
                    >
                        <ChevronLeft
                            className={cn(
                                'h-5 w-5 transition-transform',
                                !sidebarOpen && 'rotate-180'
                            )}
                        />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;
                        const showBadge = item.href === '/notifications' && unreadCount > 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {sidebarOpen && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                                {showBadge && (
                                    <span
                                        className={cn(
                                            'absolute flex items-center justify-center h-5 min-w-[20px] px-1 text-xs font-medium bg-destructive text-destructive-foreground rounded-full',
                                            sidebarOpen ? 'right-3' : 'top-0 right-0'
                                        )}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                                {!sidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="p-4 border-t border-border space-y-4">
                    {/* Logout button */}
                    <Button
                        variant="ghost"
                        size={sidebarOpen ? 'md' : 'icon'}
                        onClick={handleLogout}
                        className={cn('w-full', sidebarOpen && 'justify-start')}
                    >
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && (
                            <span className="ml-3">Disconnect</span>
                        )}
                    </Button>

                    {/* User profile */}
                    {user && (
                        <div
                            className={cn(
                                'flex items-center gap-3 p-3 rounded-lg bg-muted/50',
                                !sidebarOpen && 'justify-center p-2'
                            )}
                        >
                            <Avatar
                                src={user.avatarUrl}
                                fallback={user.username}
                                size="sm"
                            />
                            {sidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.username}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {wallet && formatAddress(wallet.address)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
