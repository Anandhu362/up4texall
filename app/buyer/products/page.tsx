'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { getProducts, addToWishlist, getWishlist } from '@/lib/firebase/firestore';
import { Product, ProductFilters } from '@/types';
import { useCart } from '@/lib/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import {
    TEXTILE_CATEGORIES,
    TARGET_AUDIENCE,
} from '@/lib/constants';
import { predictCutpiece } from '@/lib/api/prediction';

export const dynamic = 'force-dynamic';

// --- PREMIUM CUSTOM COMPONENTS --- //

function CustomSelect({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 bg-[#F9F9FB] border rounded-2xl text-sm transition-all duration-300 ${isOpen ? 'border-[#2B2640] shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                >
                    <span className={value ? "text-slate-900 font-medium" : "text-slate-500"}>
                        {value || `All ${label}s`}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 overflow-hidden animate-in fade-in duration-200">
                            <button
                                onClick={() => { onChange(''); setIsOpen(false); }}
                                className="w-full text-left px-5 py-3 text-sm text-slate-600 hover:bg-[#F9F9FB] hover:text-[#2B2640] transition-colors"
                            >
                                All {label}s
                            </button>
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className="w-full text-left px-5 py-3 text-sm text-slate-600 hover:bg-[#F9F9FB] hover:text-[#2B2640] transition-colors"
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

function CustomCheckbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <label className="flex items-center gap-3.5 cursor-pointer group py-2">
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer appearance-none w-[22px] h-[22px] border-2 border-slate-200 rounded-md checked:bg-[#2B2640] checked:border-[#2B2640] transition-all duration-300 cursor-pointer group-hover:border-[#2B2640]"
                />
                <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-sm font-medium text-slate-600 select-none group-hover:text-slate-900 transition-colors">{label}</span>
        </label>
    );
}


// --- MAIN PAGE COMPONENT --- //

export default function ProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState<ProductFilters>({
        material: '',
        color: '',
        hasPattern: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        searchQuery: '',
        textileCategory: '',
        idealFor: [],
        targetAudience: [],
        isCutpiece: undefined,
    });

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, products]);

    const loadData = async () => {
        try {
            const [productsData, wishlistData] = await Promise.all([
                getProducts(),
                user ? getWishlist(user.uid) : Promise.resolve([]),
            ]);
            setProducts(productsData);
            setFilteredProducts(productsData);
            setWishlist(wishlistData);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.material.toLowerCase().includes(query)
            );
        }

        if (filters.material) {
            filtered = filtered.filter((p) => p.material.toLowerCase() === filters.material!.toLowerCase());
        }

        if (filters.color) {
            filtered = filtered.filter((p) => p.color.toLowerCase() === filters.color!.toLowerCase());
        }

        if (filters.hasPattern !== undefined) {
            filtered = filtered.filter((p) => p.hasPattern === filters.hasPattern);
        }

        if (filters.minPrice !== undefined) {
            filtered = filtered.filter((p) => p.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
        }

        if (filters.textileCategory) {
            filtered = filtered.filter((p) => p.textileCategory === filters.textileCategory);
        }

        if (filters.targetAudience && filters.targetAudience.length > 0) {
            filtered = filtered.filter((p) =>
                p.targetAudience?.some((item) => filters.targetAudience!.includes(item))
            );
        }

        if (filters.isCutpiece !== undefined) {
            filtered = filtered.filter((p) => p.isCutpiece === filters.isCutpiece);
        }

        setFilteredProducts(filtered);
    };

    const { addToCart } = useCart();

    const handleAddToCart = async (product: Product) => {
        if (!user) return;

        if (product.isCutpiece) {
            const confirmPrediction = confirm(
                'This is a cutpiece. Would you like to see what you can make with it before adding to cart?'
            );

            if (confirmPrediction) {
                try {
                    alert('Running prediction analysis...');
                    const prediction = await predictCutpiece(product);
                    alert(`Prediction Result:\n${prediction.message}\nEfficiency: ${prediction.efficiency}%`);

                    if (!confirm('Do you still want to add this to your cart?')) {
                        return;
                    }
                } catch (error) {
                    console.error('Prediction failed', error);
                    alert('Prediction failed, adding to cart anyway.');
                }
            }
        }

        await addToCart(product.id, 1);
    };

    const handleAddToWishlist = async (productId: string) => {
        if (!user) return;
        try {
            await addToWishlist(user.uid, productId);
            setWishlist([...wishlist, productId]);
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            alert('Failed to add to wishlist');
        }
    };

    const clearFilters = () => {
        setFilters({
            material: '', color: '', hasPattern: undefined, minPrice: undefined, maxPrice: undefined,
            searchQuery: '', textileCategory: '', idealFor: [], targetAudience: [], isCutpiece: undefined,
        });
    };

    const uniqueMaterials = Array.from(new Set(products.map((p) => p.material)));
    const uniqueColors = Array.from(new Set(products.map((p) => p.color)));

    // Helper for translating Pattern dropdown to boolean
    const handlePatternChange = (val: string) => {
        if (val === 'Patterned') setFilters({ ...filters, hasPattern: true });
        else if (val === 'Solid Color') setFilters({ ...filters, hasPattern: false });
        else setFilters({ ...filters, hasPattern: undefined });
    };
    const currentPatternValue = filters.hasPattern === true ? 'Patterned' : filters.hasPattern === false ? 'Solid Color' : '';

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading products...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">Discover Products</h1>
                <p className="text-lg text-slate-500">Browse unique upcycled items from creative sellers</p>
            </div>

            {/* Premium Search Bar */}
            <div className="mb-8 relative w-full lg:max-w-3xl">
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={filters.searchQuery || ''}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    placeholder="Search products, materials, or sellers..."
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all"
                />
            </div>

            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden w-full py-4 bg-[#2B2640] text-white rounded-full font-medium mb-8"
            >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className="flex flex-col lg:flex-row gap-10">
                
                {/* --- CONTAINERIZED SIDEBAR CARD --- */}
                <aside className={`w-full lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:sticky lg:top-28">
                        
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-semibold tracking-tight text-slate-900">Filters</h3>
                            <button onClick={clearFilters} className="text-sm font-medium text-[#5F558C] hover:text-[#2B2640] transition-colors">Clear All</button>
                        </div>

                        {/* Dropdowns - Fixed TypeScript Errors by adding || '' */}
                        <CustomSelect label="Material" options={uniqueMaterials} value={filters.material || ''} onChange={(val) => setFilters({ ...filters, material: val })} />
                        <CustomSelect label="Color" options={uniqueColors} value={filters.color || ''} onChange={(val) => setFilters({ ...filters, color: val })} />
                        <CustomSelect label="Pattern" options={['Patterned', 'Solid Color']} value={currentPatternValue} onChange={handlePatternChange} />

                        <div className="h-px bg-slate-100 my-8"></div>

                        <div className="mb-8">
                            <CustomCheckbox 
                                label="Show only Cutpieces" 
                                checked={filters.isCutpiece === true} 
                                onChange={(val) => setFilters({ ...filters, isCutpiece: val ? true : undefined })} 
                            />
                        </div>

                        <CustomSelect label="Category" options={TEXTILE_CATEGORIES} value={filters.textileCategory || ''} onChange={(val) => setFilters({ ...filters, textileCategory: val })} />

                        {/* Checkboxes for Audience */}
                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Audience</label>
                            <div className="space-y-1">
                                {TARGET_AUDIENCE.map((audience) => (
                                    <CustomCheckbox
                                        key={audience}
                                        label={audience}
                                        checked={(filters.targetAudience || []).includes(audience)}
                                        onChange={(checked) => {
                                            const current = filters.targetAudience || [];
                                            const updated = checked ? [...current, audience] : current.filter((i) => i !== audience);
                                            setFilters({ ...filters, targetAudience: updated });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Price Inputs */}
                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Price Range</label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    value={filters.minPrice || ''}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full px-4 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#2B2640] transition-all" 
                                />
                                <span className="text-slate-400">-</span>
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    value={filters.maxPrice || ''}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full px-4 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#2B2640] transition-all" 
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <p className="text-sm text-slate-500">Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of <strong className="text-slate-900">{products.length}</strong> products</p>
                        </div>
                    </div>
                </aside>

                {/* --- MAIN PRODUCT GRID / EMPTY STATE --- */}
                <div className="flex-1">
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] py-32 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                            <div className="w-24 h-24 mb-6 bg-[#F9F9FB] rounded-full flex items-center justify-center">
                                <span className="text-4xl">🔍</span>
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">No products found</h3>
                            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
                                It looks like there are no products available yet, or none matching your filters.
                            </p>
                            <button 
                                onClick={clearFilters} 
                                className="px-8 py-3.5 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
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
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleAddToWishlist(product.id);
                                            }}
                                            className={`absolute top-3 right-3 p-2.5 rounded-full shadow-sm backdrop-blur-sm transition-all duration-300 ${
                                                wishlist.includes(product.id)
                                                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                                    : 'bg-white/90 text-slate-400 hover:bg-white hover:text-red-500'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill={wishlist.includes(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </Link>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col">
                                        <Link href={`/buyer/products/${product.id}`}>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#5F558C] transition-colors line-clamp-1">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                            {product.description}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="px-2.5 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                                {product.material}
                                            </span>
                                            <span className="px-2.5 py-1 bg-[#F9F9FB] text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                                {product.color}
                                            </span>
                                            {product.isCutpiece && (
                                                <span className="px-2.5 py-1 bg-[#EAE6F5] text-[#5F558C] rounded-lg text-xs font-medium border border-[#D5CEEB]">
                                                    Cutpiece
                                                </span>
                                            )}
                                        </div>

                                        {/* Pricing & CTA */}
                                        <div className="mt-auto pt-4 border-t border-slate-100">
                                            <div className="flex items-end justify-between mb-4">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400 mb-0.5">Price</p>
                                                    <p className="text-xl font-bold text-slate-900">
                                                        ₹{product.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <p className={`text-sm font-medium ${product.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.quantity === 0}
                                                className="w-full py-3.5 bg-[#2B2640] text-white rounded-xl font-medium transition-all duration-300 hover:bg-[#1E1A2F] disabled:opacity-50 disabled:hover:bg-[#2B2640] flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}