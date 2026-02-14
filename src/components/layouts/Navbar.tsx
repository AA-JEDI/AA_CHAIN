'use client';

import { useAuthStore } from '@/state/authStore';
import { useUIStore } from '@/state/uiStore';
import { Button } from '@/components/ui';
import { formatAddress } from '@/lib/utils';
import { Menu, Wallet } from 'lucide-react';

export function Navbar() {
    const { wallet } = useAuthStore();
    const { toggleSidebar } = useUIStore();

    return (
        <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left section - Mobile menu only */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Wallet status */}
                    {wallet && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {formatAddress(wallet.address, 4)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {parseFloat(wallet.balance).toFixed(4)} ETH
                            </span>
                        </div>
                    )}

                    {/* Mobile wallet */}
                    {wallet && (
                        <div className="sm:hidden flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 border border-border">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-medium">{parseFloat(wallet.balance).toFixed(4)} ETH</span>
                        </div>
                    )}

                    {/* Not connected state */}
                    {!wallet && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-sm text-muted-foreground">Not Connected</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
