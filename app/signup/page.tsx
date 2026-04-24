'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signUp } from '@/lib/firebase/auth';
import { UserRole } from '@/types';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultRole = (searchParams.get('role') as UserRole) || 'buyer';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: defaultRole,
        phone: '',
        address: '',
        businessName: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await signUp({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: formData.role,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                businessName: formData.businessName || undefined,
            });

            // Redirect based on role
            if (formData.role === 'seller') {
                router.push('/seller/dashboard');
            } else {
                router.push('/buyer/products');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[600px] w-full relative z-10 flex flex-col items-center">
            
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
                    Create Your Account
                </h2>
                <p className="text-slate-500">
                    Join the sustainable revolution today.
                </p>
            </div>

            {/* Main Form Card */}
            <div className="w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            I want to *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                                    formData.role === 'buyer'
                                        ? 'border-[#2B2640] bg-[#F9F9FB] shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                            >
                                <span className="text-3xl">🛍️</span>
                                <span className={`font-medium ${formData.role === 'buyer' ? 'text-[#2B2640]' : 'text-slate-600'}`}>
                                    Buy Products
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'seller' })}
                                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                                    formData.role === 'seller'
                                        ? 'border-[#2B2640] bg-[#F9F9FB] shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                            >
                                <span className="text-3xl">🏪</span>
                                <span className={`font-medium ${formData.role === 'seller' ? 'text-[#2B2640]' : 'text-slate-600'}`}>
                                    Sell Products
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password *
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    {/* Conditional Fields based on Role */}
                    <div className="transition-all duration-300 ease-in-out">
                        {/* Address (for buyers) */}
                        {formData.role === 'buyer' && (
                            <div className="space-y-2 animate-fadeIn">
                                <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                                    Shipping Address
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all resize-none"
                                    placeholder="123 Main St, City, State, ZIP"
                                />
                            </div>
                        )}

                        {/* Business Name (for sellers) */}
                        {formData.role === 'seller' && (
                            <div className="space-y-2 animate-fadeIn">
                                <label htmlFor="businessName" className="block text-sm font-medium text-slate-700">
                                    Business Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="businessName"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                    placeholder="My Upcycling Business"
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#2B2640] text-white rounded-full font-medium transition-all duration-300 hover:bg-[#1E1A2F] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-sm text-slate-500 pt-2">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-slate-900 hover:text-[#2B2640] hover:underline transition-colors">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
            
            {/* Back to Home Link */}
            <Link 
                href="/" 
                className="mt-8 mb-12 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <span>←</span> Back to Home
            </Link>
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-6 py-12 font-sans">
            <Suspense fallback={
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="text-sm font-medium text-slate-500">Loading form...</div>
                </div>
            }>
                <SignupForm />
            </Suspense>
        </div>
    );
}