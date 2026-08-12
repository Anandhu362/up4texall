'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { Product } from '@/types';
// We are importing your ALREADY EXISTING function from firestore.ts
import { getProduct } from '@/lib/firebase/firestore'; 

export default function ProductDetailsPage() {
    const params = useParams();
    const productId = params.id as string;
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Call your existing Firebase function using the ID from the URL
                const data = await getProduct(productId);
                setProduct(data);
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading product details...</div>
            </div>
        );
    }
    
    if (!product) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center py-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h2>
                <Link href="/buyer/products" className="text-[#5F558C] hover:underline">
                    &larr; Return to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Link href="/buyer/products" className="text-[#5F558C] hover:underline mb-8 inline-block font-medium">
                &larr; Back to Products
            </Link>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row">
                
                {/* Product Image Section */}
                <div className="md:w-1/2 bg-[#F9F9FB] relative min-h-[400px]">
                    {product.images && product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                            No Image Available
                        </div>
                    )}
                </div>

                {/* Product Details Section */}
                <div className="md:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-sm font-medium border border-slate-200">
                            {product.material}
                        </span>
                        <span className="px-3 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-sm font-medium border border-slate-200">
                            {product.color}
                        </span>
                        {product.isCutpiece && (
                            <span className="px-3 py-1 bg-[#EAE6F5] text-[#5F558C] rounded-lg text-sm font-medium border border-[#D5CEEB]">
                                Cutpiece
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        {product.name}
                    </h1>
                    
                    <div className="text-3xl font-bold text-[#2B2640] mb-6">
                        ₹{product.price.toFixed(2)}
                    </div>

                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                        {product.description}
                    </p>
                    
                    <div className="mb-8">
                         <p className={`font-medium ${product.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {product.quantity > 0 ? `${product.quantity} items available in stock` : 'Currently out of stock'}
                        </p>
                    </div>

                    <button 
                        onClick={() => addToCart(product.id, 1)}
                        disabled={product.quantity === 0}
                        className="w-full py-4 bg-[#2B2640] text-white rounded-xl font-medium text-lg transition-all duration-300 hover:bg-[#1E1A2F] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                </div>
            </div>
        </div>
    );
}