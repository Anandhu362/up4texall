'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';
import { getWishlist, getProduct, removeFromWishlist } from '@/lib/firebase/firestore';
import { useCart } from '@/lib/context/CartContext';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadWishlist();
        }
    }, [user]);

    const loadWishlist = async () => {
        if (!user) return;

        try {
            const wishlistIds = await getWishlist(user.uid);
            const productsData = await Promise.all(
                wishlistIds.map((id) => getProduct(id))
            );
            // Filter out any nulls (in case a product was deleted)
            setProducts(productsData.filter((p) => p !== null) as Product[]);
        } catch (error) {
            console.error('Error loading wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        if (!user) return;
        try {
            await removeFromWishlist(user.uid, productId);
            setProducts(products.filter((p) => p.id !== productId));
        } catch (error) {
            console.error('Error removing from wishlist', error);
        }
    };

    const handleAddToCart = async (productId: string) => {
        if (!user) return;
        setAddingToCart(productId);
        try {
            // Uses Context so the header counter updates automatically
            await addToCart(productId, 1);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading wishlist...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-red-500">❤️</span> My Wishlist
                </h1>
                <p className="text-lg text-slate-500">
                    You have <strong className="text-slate-900">{products.length}</strong> item{products.length !== 1 ? 's' : ''} saved
                </p>
            </div>

            {products.length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 mb-6 bg-[#F9F9FB] rounded-full flex items-center justify-center">
                        <span className="text-4xl">❤️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">Your wishlist is empty</h3>
                    <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
                        Browse our unique upcycled products and save your favorites here for later.
                    </p>
                    <Link 
                        href="/buyer/products" 
                        className="px-8 py-3.5 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                /* Product Grid */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col group hover:-translate-y-1">
                            
                            {/* Product Image */}
                            <Link href={`/buyer/products/${product.id}`} className="block relative h-48 bg-[#F9F9FB] rounded-2xl mb-5 overflow-hidden">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                                        No Image Available
                                    </div>
                                )}
                            </Link>

                            {/* Product Info */}
                            <div className="flex-1 flex flex-col">
                                <Link href={`/buyer/products/${product.id}`}>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#5F558C] transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                    {product.description || 'No description provided.'}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-2.5 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                        {product.material}
                                    </span>
                                    <span className="px-2.5 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                        {product.color}
                                    </span>
                                </div>

                                {/* Pricing & Actions */}
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 mb-0.5">Price</p>
                                            <p className="text-xl font-bold text-slate-900">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAddToCart(product.id)}
                                            disabled={addingToCart === product.id}
                                            className="flex-1 py-3.5 bg-[#2B2640] text-white rounded-xl font-medium transition-all duration-300 hover:bg-[#1E1A2F] disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                                        </button>
                                        
                                        <button
                                            onClick={() => handleRemove(product.id)}
                                            title="Remove from wishlist"
                                            className="p-3.5 bg-[#F9F9FB] text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-100 flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}