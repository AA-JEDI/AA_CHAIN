export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}
