'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';
import { getSellerProducts, getSellerOrders } from '@/lib/firebase/firestore';
import { Product, Order } from '@/types';
import Link from 'next/link';

export default function SellerDashboard() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        try {
            const [productsData, ordersData] = await Promise.all([
                getSellerProducts(user.uid),
                getSellerOrders(user.uid),
            ]);

            setProducts(productsData);
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const totalRevenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-lg text-slate-500">
                    {user?.businessName || 'Manage your store and track your sales'}
                </p>
            </div>

            {/* Low Stock Alert */}
            {products.filter((p) => p.quantity < 5).length > 0 && (
                <div className="bg-amber-50 border border-amber-100 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-amber-900 mb-2 flex items-center gap-2">
                            ⚠️ Low Stock Alert
                        </h2>
                        <p className="text-amber-700/80">
                            You have <strong className="font-bold">{products.filter((p) => p.quantity < 5).length}</strong> product(s) running low on stock.
                        </p>
                    </div>
                    <Link 
                        href="/seller/inventory" 
                        className="px-8 py-3.5 bg-amber-500 text-white font-medium rounded-full hover:bg-amber-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-center whitespace-nowrap"
                    >
                        Manage Inventory
                    </Link>
                </div>
            )}

            {/* Premium Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Total Products Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between h-48 group">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-[#F9F9FB] rounded-2xl flex items-center justify-center text-2xl border border-slate-100 group-hover:border-[#2B2640]/20 transition-colors">
                            📦
                        </div>
                        <Link href="/seller/inventory" className="text-sm font-medium text-slate-400 hover:text-[#2B2640] transition-colors">
                            View all ↗
                        </Link>
                    </div>
                    <div>
                        <p className="text-4xl font-bold tracking-tight text-slate-900 mb-1">{products.length}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</p>
                    </div>
                </div>

                {/* Pending Orders Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between h-48 group">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl border border-pink-100 group-hover:border-pink-200 transition-colors">
                            🔔
                        </div>
                        <Link href="/seller/orders" className="text-sm font-medium text-slate-400 hover:text-pink-600 transition-colors">
                            Manage ↗
                        </Link>
                    </div>
                    <div>
                        <p className="text-4xl font-bold tracking-tight text-slate-900 mb-1">{pendingOrders}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</p>
                    </div>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between h-48 group">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100 group-hover:border-emerald-200 transition-colors">
                            💰
                        </div>
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            {orders.length} total sales
                        </span>
                    </div>
                    <div>
                        <p className="text-4xl font-bold tracking-tight text-slate-900 mb-1">₹{totalRevenue.toFixed(2)}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders Section (Takes up 2/3 width on large screens) */}
                <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Recent Orders</h2>
                        {orders.length > 5 && (
                            <Link href="/seller/orders" className="text-sm font-medium text-[#5F558C] hover:text-[#2B2640] transition-colors">
                                View All
                            </Link>
                        )}
                    </div>
                    
                    {orders.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Once customers start buying your upcycled materials, their orders will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, 5).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F9F9FB] border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors gap-4"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">
                                            Order from {order.buyerName}
                                        </p>
                                        <p className="text-sm font-medium text-slate-500">
                                            {order.items.length} item(s) • <span className="text-slate-700">₹{order.total.toFixed(2)}</span>
                                        </p>
                                    </div>
                                    <div className="sm:text-right">
                                        <span
                                            className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${
                                                order.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : order.status === 'processing'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : order.status === 'shipped'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                            : order.status === 'delivered'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions Sidebar (Takes up 1/3 width) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">Quick Actions</h2>
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/seller/inventory?action=add"
                                className="w-full py-4 bg-[#2B2640] text-white rounded-full font-medium transition-all duration-300 hover:bg-[#1E1A2F] hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add New Product
                            </Link>
                            <Link
                                href="/seller/orders"
                                className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-medium transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Manage Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}