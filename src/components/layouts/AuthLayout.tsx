import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Left panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <span className="text-2xl font-bold">F</span>
                            </div>
                            <span className="text-2xl font-bold">FreelanceDAO</span>
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold leading-tight">
                            Trustless Freelance Agreements
                        </h1>
                        <p className="text-lg text-white/80 max-w-md">
                            Create secure agreements, manage escrow payments, and work with
                            confidence using blockchain technology.
                        </p>

                        <div className="flex items-center gap-8 pt-4">
                            <div>
                                <p className="text-3xl font-bold">100%</p>
                                <p className="text-sm text-white/70">Trustless</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">0%</p>
                                <p className="text-sm text-white/70">Platform Fees</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">24/7</p>
                                <p className="text-sm text-white/70">Available</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-white/60">
                        © 2024 FreelanceDAO. All rights reserved.
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Right panel - Auth form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">F</span>
                            </div>
                            <span className="text-2xl font-bold text-gradient">FreelanceDAO</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                        {subtitle && (
                            <p className="mt-2 text-muted-foreground">{subtitle}</p>
                        )}
                    </div>

                    {/* Form content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
