'use client';

import * as React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { hardhat, sepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Hardhat localhost chain configuration
const localhost = {
    ...hardhat,
    id: 31337,
    name: 'Localhost',
    network: 'localhost',
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
        public: { http: ['http://127.0.0.1:8545'] },
    },
} as const;

// Wagmi config using RainbowKit's getDefaultConfig
const config = getDefaultConfig({
    appName: 'FreelanceDAO Escrow',
    projectId: 'freelance-dao-escrow', // WalletConnect project ID (optional for localhost)
    chains: [localhost, sepolia, mainnet],
    transports: {
        [localhost.id]: http('http://127.0.0.1:8545'),
        [sepolia.id]: http(),
        [mainnet.id]: http(),
    },
    ssr: true,
});

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

interface Web3ProviderProps {
    children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration errors
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    modalSize="compact"
                    initialChain={localhost}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// Re-export wagmi config for use in hooks
export { config };
