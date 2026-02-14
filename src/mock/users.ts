import { User } from '@/types';

export const mockUsers: User[] = [
    {
        id: 'user_001',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bE2a',
        username: 'alice_dev',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        createdAt: '2024-01-15T10:00:00Z',
    },
    {
        id: 'user_002',
        walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        username: 'bob_designer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        createdAt: '2024-01-10T08:30:00Z',
    },
    {
        id: 'user_003',
        walletAddress: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
        username: 'charlie_writer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        createdAt: '2024-01-05T15:20:00Z',
    },
    {
        id: 'user_004',
        walletAddress: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        username: 'diana_marketer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
        createdAt: '2024-01-12T11:45:00Z',
    },
    {
        id: 'user_005',
        walletAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
        username: 'evan_blockchain',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=evan',
        createdAt: '2024-01-08T09:15:00Z',
    },
];

// Current logged-in user (mock)
export const currentUser = mockUsers[0];

export const getUserById = (id: string): User | undefined => {
    return mockUsers.find((user) => user.id === id);
};

export const searchUsers = (query: string): User[] => {
    if (!query) return [];
    const lowercaseQuery = query.toLowerCase();
    return mockUsers.filter(
        (user) =>
            user.username.toLowerCase().includes(lowercaseQuery) ||
            user.walletAddress.toLowerCase().includes(lowercaseQuery)
    );
};
