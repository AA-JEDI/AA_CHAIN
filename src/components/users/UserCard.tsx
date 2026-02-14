'use client';

import { User } from '@/types';
import { formatAddress } from '@/lib/utils';
import { Card, Avatar, Button } from '@/components/ui';
import { UserPlus } from 'lucide-react';

interface UserCardProps {
    user: User;
    onPropose?: (user: User) => void;
    showPropose?: boolean;
}

export function UserCard({ user, onPropose, showPropose = true }: UserCardProps) {
    return (
        <Card className="p-4 hover-lift">
            <div className="flex items-center gap-4">
                <Avatar src={user.avatarUrl} fallback={user.username} size="lg" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">@{user.username}</p>
                    <p className="text-sm text-muted-foreground truncate">
                        {formatAddress(user.walletAddress)}
                    </p>
                </div>
                {showPropose && onPropose && (
                    <Button size="sm" onClick={() => onPropose(user)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Propose
                    </Button>
                )}
            </div>
        </Card>
    );
}
