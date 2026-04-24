'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';
import { getSellerOrders, updateOrderStatus } from '@/lib/firebase/firestore';
import { Order, OrderStatus } from '@/types';
import Image from 'next/image';

// --- PREMIUM CUSTOM COMPONENTS --- //

function StatusSelect({ value, onChange }: { value: OrderStatus, onChange: (val: OrderStatus) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const options: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    return (
        <div className="relative w-full sm:w-48">
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 bg-[#F9F9FB] border rounded-2xl text-sm font-medium capitalize transition-all duration-300 ${isOpen ? 'border-[#2B2640] shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                >
                    <span className="text-slate-900">
                        {value}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 overflow-hidden animate-in fade-in duration-200">
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className={`w-full text-left px-5 py-3 text-sm capitalize transition-colors ${value === opt ? 'bg-[#F9F9FB] text-[#2B2640] font-semibold' : 'text-slate-600 hover:bg-[#F9F9FB] hover:text-[#2B2640]'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT --- //

export default function SellerOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;

        try {
            const data = await getSellerOrders(user.uid);
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders(
                orders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const filteredOrders =
        filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">Order Management</h1>
                <p className="text-lg text-slate-500">Track and manage your customer orders</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as OrderStatus | 'all')}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize transition-all duration-300 border ${
                            filter === status
                                ? 'bg-[#2B2640] text-white border-[#2B2640] shadow-md hover:-translate-y-0.5'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {status}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {status === 'all' 
                                ? orders.length 
                                : orders.filter((o) => o.status === status).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 mb-6 bg-[#F9F9FB] rounded-full flex items-center justify-center">
                        <span className="text-4xl">📭</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">No {filter !== 'all' && filter} orders found</h3>
                    <p className="text-slate-500 max-w-sm leading-relaxed">
                        When a customer places an order, it will appear here for you to process.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                            
                            {/* Order Header */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 pb-6 border-b border-slate-100 gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold tracking-tight text-slate-900">
                                            Order #{order.id.slice(0, 8).toUpperCase()}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        ${order.total.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">{order.items.length} item(s)</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* Customer Info */}
                                <div className="bg-[#F9F9FB] p-6 rounded-2xl border border-slate-100">
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Customer Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="block text-slate-400 text-xs mb-0.5">Name</span>
                                            <span className="font-medium text-slate-900">{order.buyerName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-slate-400 text-xs mb-0.5">Email</span>
                                            <span className="font-medium text-slate-900">{order.buyerEmail}</span>
                                        </div>
                                        <div>
                                            <span className="block text-slate-400 text-xs mb-0.5">Shipping Address</span>
                                            <span className="font-medium text-slate-900 block leading-relaxed">{order.shippingAddress}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Order Items</h4>
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                                            >
                                                <div className="relative w-14 h-14 bg-[#F9F9FB] rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.productName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                                            No img
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{item.productName}</p>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right pl-4">
                                                    <p className="font-bold text-slate-900">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Status Update Action */}
                            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 mb-1">Update Order Status</p>
                                    <p className="text-xs text-slate-500">Keep your customer informed about their order progress.</p>
                                </div>
                                <StatusSelect 
                                    value={order.status} 
                                    onChange={(newStatus) => handleStatusUpdate(order.id, newStatus)} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}