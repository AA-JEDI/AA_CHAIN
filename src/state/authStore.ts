import { create } from 'zustand';
import { User, WalletState } from '@/types';
import { currentUser } from '@/mock/users';
import { walletService } from '@/services/walletService';

interface AuthState {
    user: User | null;
    wallet: WalletState | null;
    isAuthenticated: boolean;
    isConnecting: boolean;
    error: string | null;
    // Track connection attempts to allow re-connection
    connectionAttempt: number;

    // Actions
    login: (user: User, wallet: WalletState) => void;
    logout: () => void;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    setError: (error: string | null) => void;
    resetAuthState: () => void;
}

// Initial state factory - allows clean reset
const getInitialState = () => ({
    user: currentUser, // Keep mock user for demo
    wallet: null,
    isAuthenticated: false,
    isConnecting: false,
    error: null,
    connectionAttempt: 0,
});

export const useAuthStore = create<AuthState>((set, get) => ({
    ...getInitialState(),

    login: (user, wallet) =>
        set({
            user,
            wallet,
            isAuthenticated: true,
            error: null,
            isConnecting: false, // Ensure connecting state is cleared
        }),

    logout: () => {
        // Clear all auth state completely
        set({
            user: null,
            wallet: null,
            isAuthenticated: false,
            isConnecting: false,
            error: null,
        });
    },

    connectWallet: async () => {
        const state = get();

        // Prevent multiple simultaneous connection attempts
        if (state.isConnecting) {
            console.log('[Auth] Connection already in progress');
            return;
        }

        // Update connection attempt counter for tracking
        set({
            isConnecting: true,
            error: null,
            connectionAttempt: state.connectionAttempt + 1
        });

        try {
            const wallet = await walletService.connect();

            // Success - update state atomically
            set({
                wallet,
                isConnecting: false,
                isAuthenticated: true,
                error: null,
                user: currentUser, // Restore user on successful connect
            });

            console.log('[Auth] Wallet connected successfully:', wallet.address);
        } catch (error: any) {
            console.error('[Auth] Wallet connection failed:', error);

            // Failure - reset to clean state
            set({
                error: error.message || 'Failed to connect wallet',
                isConnecting: false,
                isAuthenticated: false,
                wallet: null,
            });
        }
    },

    disconnectWallet: () => {
        console.log('[Auth] Disconnecting wallet');

        // Fully reset auth state to allow clean reconnection
        set({
            wallet: null,
            user: null,
            isAuthenticated: false,
            isConnecting: false,
            error: null,
        });
    },

    setError: (error) => set({ error }),

    // Complete reset - useful for debugging or forced logout
    resetAuthState: () => {
        console.log('[Auth] Full state reset');
        set(getInitialState());
    },
}));
