'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as firestoreAddToCart } from '@/lib/firebase/firestore';
import { useCartClassifier } from '@/lib/hooks/useCartClassifier';
import { getProduct } from '@/lib/firebase/firestore';

interface CartContextType {
    cartCount: number;
    refreshCart: () => Promise<void>;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    notification: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [notification, setNotification] = useState<string | null>(null);
    const { classifyAndNotify } = useCartClassifier();

    useEffect(() => {
        if (user) {
            refreshCart();
        } else {
            setCartCount(0);
        }
    }, [user]);

    const refreshCart = async () => {
        if (!user) return;
        try {
            const items = await getCart(user.uid);
            const count = items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
        } catch (error) {
            console.error('Error refreshing cart:', error);
        }
    };

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!user) return;

        try {
            await firestoreAddToCart(user.uid, productId, quantity);
            await refreshCart();

            // Trigger classification
            const cartItems = await getCart(user.uid);
            const itemsWithProducts = await Promise.all(
                cartItems.map(async (item) => {
                    const product = await getProduct(item.productId);
                    return { ...item, product: product! };
                })
            );

            const message = await classifyAndNotify(itemsWithProducts.filter(i => i.product));

            // Show notification
            const notiMessage = `Added to cart! ${message || ''}`;
            setNotification(notiMessage);

            // Clear notification after 5 seconds
            setTimeout(() => setNotification(null), 5000);

        } catch (error) {
            console.error('Error adding to cart:', error);
            setNotification('Failed to add to cart');
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, refreshCart, addToCart, notification }}>
            {children}
            {/* Global Toast Notification */}
            {notification && (
                <div className="fixed top-24 right-4 z-50 animate-slide-in-right max-w-sm w-full">
                    <div className="bg-white border-l-4 border-purple-600 shadow-xl rounded-lg p-4 flex items-start gap-3">
                        <div className="text-2xl">🛍️</div>
                        <div>
                            <h4 className="font-bold text-gray-800">Cart Updated</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{notification}</p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
