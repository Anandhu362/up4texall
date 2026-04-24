'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                router.push('/');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-600">Loading Admin Portal...</div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Admin Navbar */}
            <nav className="bg-white shadow-sm z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link href="/admin/dashboard" className="flex-shrink-0 flex items-center gap-2">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/r_logo.png"
                                        alt="Up4TexAll"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="font-bold text-xl text-gray-900">Up4TexAll Admin</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 text-sm">Welcome, {user.name}</span>
                            <button
                                onClick={() => router.push('/')}
                                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                            >
                                View Site
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
        </div>
    );
}
