'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';
import { getCart, updateCart, removeFromCart, getProduct } from '@/lib/firebase/firestore';
import { CartItem, Product, GarmentClassificationResult } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

import { useCart } from '@/lib/context/CartContext';

export const dynamic = 'force-dynamic';

export default function CartPage() {
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const [cartItems, setCartItems] = useState<(CartItem & { product: Product })[]>([]);
    const [loading, setLoading] = useState(true);

    const [recommendations, setRecommendations] = useState<GarmentClassificationResult | null>(null);

    // --- New AI Feature State Variables ---
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
    const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null); // NEW
    // -------------------------------------

    useEffect(() => {
        if (user) {
            loadCart();
            const stored = localStorage.getItem('latest_classification');
            if (stored) {
                try {
                    setRecommendations(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse recommendations', e);
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const updateQuantity = async (productId: string, newQuantity: number) => {
        if (!user || newQuantity < 1) return;

        const updatedItems = cartItems.map((item) =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);

        await updateCart(
            user.uid,
            updatedItems.map(({ productId, quantity }) => ({ productId, quantity }))
        );
        // Optional: refresh cart context if your context tracks total item count instead of unique items
        await refreshCart();
    };

    const handleRemove = async (productId: string) => {
        if (!user) return;

        await removeFromCart(user.uid, productId);
        await refreshCart(); // Update global cart count
        setCartItems(cartItems.filter((item) => item.productId !== productId));
    };

    // --- New AI Feature Function ---
    const handleGenerateIdea = async () => {
        if (!aiPrompt.trim() || cartItems.length === 0 || !user) return; 
        
        setIsGeneratingIdea(true);
        setGeneratedIdea(null);
        setGeneratedImage(null);

        try {
            // UPDATED: Use the environment variable to target your Express backend
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            
            const response = await fetch(`${API_URL}/api/generate-concept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    // PASS THE USER ID TO THE BACKEND
                    userId: user.uid, 
                    cartItems: cartItems.map(item => ({
                        name: item.product.name,
                        material: item.product.material,
                        color: item.product.color
                    }))
                })
            });

            const data = await response.json();
            
            // CHECK FOR RATE LIMIT STATUS SPECIFICALLY
            if (response.status === 429) {
                setGeneratedIdea(`⚠️ ${data.error}`); // Show the limit message directly in the text box
                setIsGeneratingIdea(false);
                return;
            }

            if (data.success) {
                setGeneratedIdea(data.description);
                setGeneratedImage(data.imageUrl);
            } else {
                setGeneratedIdea(data.error || 'Failed to generate idea. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            setGeneratedIdea('An error occurred. Please try again.');
        } finally {
            setIsGeneratingIdea(false);
        }
    };
    // -------------------------------------

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading cart...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-[#2B2640]">🛒</span> Shopping Cart
                </h1>
                <p className="text-lg text-slate-500">
                    <strong className="text-slate-900">{cartItems.length}</strong> item{cartItems.length !== 1 ? 's' : ''} in your cart
                </p>
            </div>

            {cartItems.length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 mb-6 bg-[#F9F9FB] rounded-full flex items-center justify-center">
                        <span className="text-4xl">🛒</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">Your cart is empty</h3>
                    <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
                        Looks like you haven't added any materials to your cart yet.
                    </p>
                    <Link 
                        href="/buyer/products" 
                        className="px-8 py-3.5 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Main Cart Items List */}
                    <div className="flex-1 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-6 items-center sm:items-start transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                
                                {/* Product Image */}
                                <div className="relative w-full sm:w-36 h-36 bg-[#F9F9FB] rounded-2xl overflow-hidden flex-shrink-0">
                                    {item.product.images?.[0] ? (
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 w-full flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <Link href={`/buyer/products/${item.product.id}`}>
                                                <h3 className="text-lg font-semibold text-slate-900 hover:text-[#5F558C] transition-colors">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="px-2.5 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                                    {item.product.material}
                                                </span>
                                                <span className="px-2.5 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                                    {item.product.color}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xl font-bold text-slate-900">
                                            ${item.product.price.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Controls (Quantity & Remove) */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-1 bg-[#F9F9FB] p-1 rounded-xl border border-slate-200">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium text-slate-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleRemove(item.productId)}
                                            className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Existing AI Efficiency Recommendations */}
                        {recommendations && recommendations.status === 'success' && (
                            <div className="bg-[#EAE6F5] p-6 md:p-8 rounded-[2rem] border border-[#D5CEEB] mt-8 transition-all duration-300">
                                <h2 className="text-2xl font-semibold text-[#2B2640] mb-2 flex items-center gap-3 tracking-tight">
                                    <span className="text-2xl">♻️</span> Upcycling Possibilities
                                </h2>
                                <p className="text-[#5F558C] mb-6 leading-relaxed">
                                    Based on the fabrics in your cart, here is what our algorithm suggests you can create.
                                </p>

                                <div className="space-y-4">
                                    {recommendations.results.single_garment_results.map((result, index) => (
                                        <div key={index} className="bg-white/80 backdrop-blur-sm border border-white p-5 rounded-2xl hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#2B2640] mb-1">
                                                        {result.garment} <span className="text-sm font-medium text-slate-500 font-normal">({result.size})</span>
                                                    </h3>
                                                    <p className="text-slate-600 text-sm">
                                                        You can generate <span className="font-bold text-slate-900">{result.copies}</span> of these complete garments!
                                                    </p>
                                                </div>
                                                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px]">
                                                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Efficiency</div>
                                                    <div className="text-lg font-bold text-emerald-600">
                                                        {result.total_util_pct.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>

                                            {result.copy_details && result.copy_details[0] && (
                                                <div className="mt-4 pt-4 border-t border-slate-200/60">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Suggested Color Plan</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(result.copy_details[0].color_assignment).map(([part, color]) => (
                                                            <div key={part} className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                                                                <span className="text-xs text-slate-500 capitalize">{part}:</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span 
                                                                        className="w-3 h-3 rounded-full border border-slate-300 shadow-inner" 
                                                                        style={{ backgroundColor: (color as string).toLowerCase() }}
                                                                    ></span>
                                                                    <span className="text-sm font-medium text-slate-900 capitalize">{color as string}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary & New AI Feature */}
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                        
                        {/* Order Summary Box */}
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:sticky lg:top-28">
                            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span className="text-slate-900 font-medium">Calculated at checkout</span>
                                </div>
                                
                                <div className="h-px bg-slate-100 my-4"></div>
                                
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total</span>
                                    <span className="text-3xl font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Link 
                                href="/buyer/checkout" 
                                className="w-full block py-4 bg-[#2B2640] text-white text-center rounded-full font-medium transition-all duration-300 hover:bg-[#1E1A2F] hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Proceed to Checkout
                            </Link>

                            <p className="text-xs text-center text-slate-400 mt-4">
                                Secure checkout powered by Stripe
                            </p>
                        </div>

                        {/* --- NEW AI CONCEPT GENERATOR UI --- */}
                        <div className="bg-[#F9F9FB] p-6 rounded-[2rem] border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] lg:sticky lg:top-[28rem]">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="text-xl">✨</span> AI Upcycle Designer
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                                Tell our AI what you want to create using the materials currently in your cart.
                            </p>
                            
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g. Suggest a design for an upcycled ladies' top in XL from my cart?"
                                className="w-full p-3 rounded-xl border border-slate-200 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#5F558C] resize-none"
                                rows={3}
                            />
                            
                            <button
                                onClick={handleGenerateIdea}
                                disabled={isGeneratingIdea || !aiPrompt.trim()}
                                className="w-full py-3 bg-gradient-to-r from-[#8378B8] to-[#5F558C] text-white rounded-xl text-sm font-medium hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                            >
                                {isGeneratingIdea ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Concept ✨'
                                )}
                            </button>

                            {/* Display the AI Result */}
                            {(generatedIdea || generatedImage) && (
                                <div className="mt-6 flex flex-col gap-4">
                                    
                                    {/* NEW: Display the Imagen 3 rendering */}
                                    {generatedImage && (
                                        <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                                            <img 
                                                src={generatedImage} 
                                                alt="AI Generated Upcycle Concept" 
                                                className="w-full h-auto object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* The Designer's Vision Text */}
                                    {generatedIdea && (
                                        <div className="p-4 bg-white rounded-xl border border-[#D5CEEB] text-sm text-slate-700 leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                                            <p className="font-semibold text-[#2B2640] mb-2">Designer's Vision:</p>
                                            <div className="whitespace-pre-wrap">{generatedIdea}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* ----------------------------------- */}
                        
                    </div>

                </div>
            )}
        </div>
    );
}