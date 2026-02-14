'use client';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/state/uiStore';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

/**
 * DashboardLayout
 * 
 * Issue #2 Fix: Layout structure explanation
 * - Sidebar is position: fixed (takes no document flow space)
 * - Main content uses margin-left to offset from sidebar
 * - No duplicate spacing: margin on main = sidebar width
 * 
 * Structure:
 * ┌─────────────────────────────────────────────┐
 * │ [Sidebar (fixed, w-64)]  [Main Content]     │
 * │                          └─ ml-64 offset    │
 * └─────────────────────────────────────────────┘
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { sidebarOpen } = useUIStore();

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar - position: fixed, does not participate in document flow */}
            <Sidebar />

            {/* 
             * Main content wrapper
             * - Uses margin-left to offset from fixed sidebar
             * - When sidebar open: ml-64 (256px)
             * - When sidebar closed: ml-20 (80px)
             * - No extra padding that would create duplicate space
             */}
            <div
                className={cn(
                    'min-h-screen flex flex-col transition-all duration-300',
                    // Margin matches sidebar width exactly - no duplicate space
                    sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                )}
            >
                {/* Navbar */}
                <Navbar />

                {/* Main content - compact padding, starts immediately below navbar */}
                <main className="flex-1 p-4">
                    {children}
                </main>
            </div>

            <ToastContainer />
        </div>
    );
}
