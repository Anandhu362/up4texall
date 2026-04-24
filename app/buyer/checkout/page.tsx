'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, getProduct, createOrder, clearCart, createNotification } from '@/lib/firebase/firestore';
import { CartItem, Product } from '@/types';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<(CartItem & { product: Product })[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [shippingAddress, setShippingAddress] = useState(user?.address || '');

    useEffect(() => {
        if (user) {
            loadCart();
            if (user.address) {
                setShippingAddress(user.address);
            }
        }
    }, [user]);

    const loadCart = async () => {
        if (!user) return;

        try {
            const cart = await getCart(user.uid);
            const itemsWithProducts = await Promise.all(
                cart.map(async (item) => {
                    const product = await getProduct(item.productId);
                    return { ...item, product: product! };
                })
            );
            setCartItems(itemsWithProducts.filter((item) => item.product));
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!user || !shippingAddress.trim()) {
            alert('Please provide a shipping address');
            return;
        }

        setSubmitting(true);

        try {
            // Group items by seller
            const itemsBySeller = cartItems.reduce((acc, item) => {
                const sellerId = item.product.sellerId;
                if (!acc[sellerId]) {
                    acc[sellerId] = [];
                }
                acc[sellerId].push(item);
                return acc;
            }, {} as Record<string, typeof cartItems>);

            // Create separate orders for each seller
            for (const [sellerId, items] of Object.entries(itemsBySeller)) {
                const orderItems = items.map((item) => ({
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    image: item.product.images[0] || '',
                }));

                const total = items.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0
                );

                const orderId = await createOrder({
                    buyerId: user.uid,
                    buyerName: user.name,
                    buyerEmail: user.email,
                    sellerId,
                    items: orderItems,
                    total,
                    status: 'pending',
                    shippingAddress,
                });

                // Notify seller
                await createNotification({
                    userId: sellerId,
                    type: 'new_order',
                    message: `New order from ${user.name} - $${total.toFixed(2)}`,
                    read: false,
                    relatedId: orderId,
                });
            }

            // Clear cart
            await clearCart(user.uid);

            // Redirect to orders page
            router.push('/buyer/orders?success=true');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    const total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading checkout...</div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        router.push('/buyer/cart');
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-[#2B2640]">💳</span> Secure Checkout
                </h1>
                <p className="text-lg text-slate-500">
                    Review your order and provide your shipping details to complete the purchase.
                </p>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6">Shipping Address</h2>
                <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-5 py-4 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:border-[#2B2640] focus:ring-1 focus:ring-[#2B2640] transition-all resize-none placeholder:text-slate-400"
                    rows={4}
                    placeholder="Enter your full street address, apartment/suite number, city, and zip code..."
                    required
                />
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6 flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-sm font-normal text-slate-500">{cartItems.length} items</span>
                </h2>
                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-[#F9F9FB] rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                    {item.product.images?.[0] ? (
                                        <img 
                                            src={item.product.images[0]} 
                                            alt={item.product.name} 
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-[10px] font-medium">No Image</div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 line-clamp-1">{item.product.name}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Qty: <span className="font-medium text-slate-700">{item.quantity}</span> 
                                        <span className="mx-2 text-slate-300">•</span> 
                                        ${item.product.price.toFixed(2)} each
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-slate-900 text-lg">
                                ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Total & Submit */}
            <div className="bg-[#F9F9FB] p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="flex justify-between items-end mb-8">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Amount</span>
                    <span className="text-4xl font-bold text-slate-900">${total.toFixed(2)}</span>
                </div>
                
                <button
                    onClick={handlePlaceOrder}
                    disabled={submitting || !shippingAddress.trim()}
                    className="w-full py-4 bg-[#2B2640] text-white text-lg font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Order...
                        </>
                    ) : (
                        'Place Order'
                    )}
                </button>
                
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure demo checkout. No actual payment will be processed.
                    </p>
                </div>
            </div>
        </div>
    );
}