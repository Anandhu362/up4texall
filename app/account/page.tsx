'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useState } from 'react';
import { updateUserProfile, changePassword } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        businessName: user?.businessName || '',
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateUserProfile(user.uid, formData);
            setSuccess('Profile updated successfully!');
            setEditing(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await changePassword(passwordData.newPassword);
            setSuccess('Password changed successfully!');
            setChangingPassword(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    if (!user) {
        return null;
    }

    // Determine the correct dashboard link based on role
    const dashboardLink = user.role === 'seller' ? '/seller/dashboard' : '/buyer/products';

    return (
        /* The new light-theme wrapper replacing the dark background */
        <div className="min-h-screen bg-[#F9F9FB] font-sans text-slate-600 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                
                {/* Back Navigation */}
                <div>
                    <Link 
                        href={dashboardLink} 
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#2B2640] transition-colors"
                    >
                        <span>←</span> Back to Dashboard
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">Account Settings</h1>
                    <p className="text-lg text-slate-500">Manage your profile and preferences</p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl text-sm font-medium">
                        {success}
                    </div>
                )}

                {/* Profile Information Card */}
                <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Profile Information</h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="text-sm font-medium text-[#5F558C] hover:text-[#2B2640] transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                    />
                                </div>

                                {user.role === 'seller' && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">Business Name</label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            {user.role === 'buyer' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Shipping Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all resize-none"
                                        rows={3}
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="px-8 py-3.5 bg-white text-slate-600 font-medium rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3.5 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-y-8 gap-x-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</p>
                                <p className="text-lg font-medium text-slate-900">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-lg font-medium text-slate-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9F9FB] border border-slate-200 rounded-lg">
                                    <span className="text-sm">{user.role === 'seller' ? '🏪' : '🛍️'}</span>
                                    <span className="text-sm font-medium text-slate-700 capitalize">{user.role}</span>
                                </div>
                            </div>
                            {user.phone && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="text-lg font-medium text-slate-900">{user.phone}</p>
                                </div>
                            )}
                            {user.address && (
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Shipping Address</p>
                                    <p className="text-lg font-medium text-slate-900 leading-relaxed max-w-2xl">{user.address}</p>
                                </div>
                            )}
                            {user.businessName && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Business Name</p>
                                    <p className="text-lg font-medium text-slate-900">{user.businessName}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Change Password Card */}
                <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Security</h2>
                        {!changingPassword && (
                            <button
                                onClick={() => setChangingPassword(true)}
                                className="text-sm font-medium text-[#5F558C] hover:text-[#2B2640] transition-colors"
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {changingPassword ? (
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setPasswordData({ newPassword: '', confirmPassword: '' });
                                    }}
                                    className="px-8 py-3.5 bg-white text-slate-600 font-medium rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3.5 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</p>
                            <p className="text-xl tracking-widest text-slate-400">••••••••</p>
                        </div>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50/50 p-8 md:p-10 rounded-[2rem] border border-red-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-red-900 mb-2">Danger Zone</h2>
                            <p className="text-red-700/80 text-sm">Log out of your account on this device.</p>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="px-8 py-3.5 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Logout Securely
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}