'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut as firebaseSignOut } from '@/lib/firebase/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'seller')) {
            router.push('/login?role=seller');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await firebaseSignOut();
            router.push('/');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB]">
                <div className="animate-pulse">
                    <div className="text-2xl font-medium text-slate-800">Loading...</div>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'seller') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F9F9FB] font-sans antialiased text-slate-600">
            {/* Minimal Premium Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/seller/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                            <div className="relative w-8 h-8">
                                <Image src="/r_logo.png" alt="Up4TexAll Logo" fill className="object-contain" priority />
                            </div>
                            <span className="text-xl font-semibold tracking-tight text-slate-900">Up4TexAll</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                href="/seller/dashboard"
                                className="text-sm font-medium text-slate-500 hover:text-[#2B2640] transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/seller/inventory"
                                className="text-sm font-medium text-slate-500 hover:text-[#2B2640] transition-colors"
                            >
                                Inventory
                            </Link>
                            <Link
                                href="/seller/orders"
                                className="text-sm font-medium text-slate-500 hover:text-[#2B2640] transition-colors"
                            >
                                Orders
                            </Link>
                            <Link
                                href="/account"
                                className="text-sm font-medium text-slate-500 hover:text-[#2B2640] transition-colors"
                            >
                                Account
                            </Link>
                            <div className="w-px h-4 bg-slate-200 mx-2"></div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation Dropdown */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100 py-4 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col space-y-4 px-2">
                            <Link
                                href="/seller/dashboard"
                                className="text-sm font-medium text-slate-600 hover:text-[#2B2640]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/seller/inventory"
                                className="text-sm font-medium text-slate-600 hover:text-[#2B2640]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Inventory
                            </Link>
                            <Link
                                href="/seller/orders"
                                className="text-sm font-medium text-slate-600 hover:text-[#2B2640]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Orders
                            </Link>
                            <Link
                                href="/account"
                                className="text-sm font-medium text-slate-600 hover:text-[#2B2640]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Account
                            </Link>
                            <div className="h-px bg-slate-100 my-2"></div>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="text-sm font-medium text-red-500 text-left"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
                {children}
            </main>
        </div>
    );
}