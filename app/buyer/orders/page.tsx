'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';
import { getBuyerOrders } from '@/lib/firebase/firestore';
import { Order } from '@/types';
import Link from 'next/link';

export default function BuyerOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;

        try {
            const data = await getBuyerOrders(user.uid);
            // Sort orders by newest first
            const sortedOrders = data.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render premium fintech-style status badges
    const getStatusBadge = (status: string) => {
        const baseStyle = "inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border";
        switch (status) {
            case 'pending':
                return `${baseStyle} bg-amber-50 text-amber-700 border-amber-200/60`;
            case 'processing':
                return `${baseStyle} bg-blue-50 text-blue-700 border-blue-200/60`;
            case 'shipped':
                return `${baseStyle} bg-[#F0EEF6] text-[#5F558C] border-[#D5CEEB]`;
            case 'delivered':
                return `${baseStyle} bg-emerald-50 text-emerald-700 border-emerald-200/60`;
            default: // cancelled or others
                return `${baseStyle} bg-red-50 text-red-700 border-red-200/60`;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading your orders...</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
            
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-[#2B2640]">📦</span> My Orders
                </h1>
                <p className="text-lg text-slate-500">
                    Track your order history and delivery status.
                </p>
            </div>

            {orders.length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] py-32 flex flex-col items-center justify-center text-center transition-all duration-300">
                    <div className="w-24 h-24 mb-6 bg-[#F9F9FB] rounded-full flex items-center justify-center border border-slate-100">
                        <span className="text-4xl">📦</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">No orders yet</h3>
                    <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
                        When you purchase upcycled materials, your order history will appear here.
                    </p>
                    <Link 
                        href="/buyer/products" 
                        className="px-8 py-3.5 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                /* Orders List */
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div 
                            key={order.id} 
                            className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
                        >
                            {/* Order Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-100">
                                <div>
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                        Order Number
                                    </p>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                        #{order.id.slice(0, 8).toUpperCase()}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="text-left md:text-right flex flex-col md:items-end gap-2">
                                    <p className="text-3xl font-bold text-slate-900">
                                        ₹{order.total.toFixed(2)}
                                    </p>
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F9F9FB] rounded-2xl border border-slate-100 gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Item Image */}
                                            <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 shadow-sm">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Item Details */}
                                            <div>
                                                <p className="font-semibold text-slate-900 line-clamp-1">{item.productName}</p>
                                                <p className="text-sm text-slate-500 mt-0.5">
                                                    Qty: <span className="font-medium text-slate-700">{item.quantity}</span>
                                                    <span className="mx-2 text-slate-300">•</span>
                                                    ₹{item.price.toFixed(2)} each
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Item Total Line */}
                                        <div className="text-left sm:text-right pl-20 sm:pl-0">
                                            <p className="font-bold text-slate-900">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}