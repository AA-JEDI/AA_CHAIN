import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'FreelanceDAO - Trustless Freelance Agreements',
    description:
        'Create secure agreements, manage escrow payments, and work with confidence using blockchain technology.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={inter.className}>
                <Web3Provider>
                    {children}
                </Web3Provider>
            </body>
        </html>
    );
}
