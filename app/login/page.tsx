'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, resetPassword } from '@/lib/firebase/auth';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const suggestedRole = searchParams.get('role');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);

    // Forgot Password State
    const [showForgot, setShowForgot] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await signIn(formData.email, formData.password);

            if (isAdminLogin) {
                if (user.role !== 'admin') {
                    throw new Error('Access denied: You are not an administrator.');
                }
                router.push('/admin/dashboard');
            } else {
                // Redirect based on role
                if (user.role === 'seller') {
                    router.push('/seller/dashboard');
                } else if (user.role === 'buyer') {
                    router.push('/buyer/products');
                } else if (user.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        setResetError('');
        setResetMessage('');

        try {
            await resetPassword(resetEmail);
            setResetMessage('If an account exists, a password reset link has been sent.');
            setResetEmail('');
        } catch (err: any) {
            setResetError(err.message || 'Failed to send reset email');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="max-w-[420px] w-full relative z-10 flex flex-col items-center">
            
            {/* Header / Logo */}
            <div className="text-center mb-8 w-full flex flex-col items-center">
                <Link href="/" className="inline-flex flex-col items-center mb-6 hover:opacity-90 transition-opacity">
                    <div className="relative w-16 h-16 mb-4">
                        <Image
                            src="/r_logo.png"
                            alt="Up4TexAll"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Up4TexAll</h1>
                </Link>
                <h2 className="text-3xl font-medium tracking-tight text-slate-900 mb-2">
                    {isAdminLogin ? 'Admin Portal' : 'Welcome back'}
                </h2>
                <p className="text-slate-500">
                    {isAdminLogin
                        ? 'Secure login for administrators'
                        : suggestedRole === 'seller'
                            ? 'Log in to manage your inventory'
                            : suggestedRole === 'buyer'
                                ? 'Log in to start sourcing materials'
                                : 'Please enter your details to sign in.'}
                </p>
            </div>

            {/* Main Form Card */}
            <div className="w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                
                {/* Admin Toggle - Integrated cleanly into the card header */}
                <div className="absolute top-6 right-6 z-10">
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdminLogin(!isAdminLogin);
                            setError('');
                            setFormData({ email: '', password: '' });
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                            isAdminLogin 
                                ? 'bg-[#2B2640] text-white shadow-md' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {isAdminLogin ? 'Admin Mode' : 'Admin Login'}
                    </button>
                </div>

                {/* Forgot Password Modal Overlay */}
                {showForgot && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-8 sm:p-10 flex flex-col justify-center transition-all duration-300">
                        <h3 className="text-2xl font-medium tracking-tight text-slate-900 mb-2">Reset Password</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Enter your email address and we will send you a link to reset your password.
                        </p>

                        {resetMessage && (
                            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl mb-6 text-sm border border-emerald-100">
                                {resetMessage}
                            </div>
                        )}
                        {resetError && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm border border-red-100">
                                {resetError}
                            </div>
                        )}

                        <form onSubmit={handleForgotSubmit} className="space-y-4">
                            <input
                                type="email"
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                placeholder="name@company.com"
                            />
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowForgot(false)} 
                                    className="flex-1 py-3.5 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={resetLoading} 
                                    className="flex-1 py-3.5 rounded-full bg-[#2B2640] text-white font-medium hover:bg-[#1E1A2F] hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {resetLoading ? 'Sending...' : 'Send Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                            placeholder={isAdminLogin ? "admin@up4texall.com" : "name@company.com"}
                            autoComplete="email"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            {!isAdminLogin && (
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-sm font-medium text-slate-500 hover:text-[#2B2640] transition-colors"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#2B2640] text-white rounded-full font-medium transition-all duration-300 hover:bg-[#1E1A2F] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                    {/* Signup Link */}
                    {!isAdminLogin && (
                        <p className="text-center text-sm text-slate-500 pt-2">
                            Don't have an account?{' '}
                            <Link
                                href={suggestedRole ? `/signup?role=${suggestedRole}` : '/signup'}
                                className="font-medium text-slate-900 hover:text-[#2B2640] hover:underline transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    )}
                </form>
            </div>

            {/* Back to Home Link */}
            <Link 
                href="/" 
                className="mt-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <span>←</span> Back to Home
            </Link>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-6 py-12 font-sans">
            <Suspense fallback={
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="text-sm font-medium text-slate-500">Loading form...</div>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}