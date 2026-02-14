'use client';

import { Amendment, Agreement } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '@/components/ui';
import { AmendmentItem } from './AmendmentItem';
import { FileEdit } from 'lucide-react';

interface AmendmentHistoryListProps {
    amendments: Amendment[];
    agreement: Agreement;
}

export function AmendmentHistoryList({
    amendments,
    agreement,
}: AmendmentHistoryListProps) {
    if (amendments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileEdit className="h-5 w-5" />
                        Amendment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon="file"
                        title="No Amendments"
                        description="No amendments have been proposed for this agreement yet."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileEdit className="h-5 w-5" />
                    Amendment History
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({amendments.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {amendments.map((amendment) => (
                        <AmendmentItem
                            key={amendment.id}
                            amendment={amendment}
                            agreement={agreement}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
