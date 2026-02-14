'use client';

import * as React from 'react';
import { Input } from '@/components/ui';
import { userService } from '@/services';
import { User } from '@/types';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSearchBarProps {
    onSelect: (user: User) => void;
    placeholder?: string;
    excludeUserId?: string;
}

export function UserSearchBar({
    onSelect,
    placeholder = 'Search users by username or wallet address...',
    excludeUserId,
}: UserSearchBarProps) {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<User[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const search = async () => {
            setIsSearching(true);
            try {
                const users = await userService.search(query);
                setResults(
                    excludeUserId
                        ? users.filter((u) => u.id !== excludeUserId)
                        : users
                );
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query, excludeUserId]);

    const handleSelect = (user: User) => {
        onSelect(user);
        setQuery('');
        setShowResults(false);
    };

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder={placeholder}
                icon={
                    isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )
                }
            />

            {/* Results dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    {results.map((user) => (
                        <button
                            key={user.id}
                            className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left transition-colors"
                            onClick={() => handleSelect(user)}
                        >
                            <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="h-10 w-10 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">@{user.username}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.walletAddress}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showResults && query && !isSearching && results.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl p-4 text-center text-sm text-muted-foreground">
                    No users found for &quot;{query}&quot;
                </div>
            )}
        </div>
    );
}
