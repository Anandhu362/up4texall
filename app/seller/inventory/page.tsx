'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect, useState } from 'react';
import {
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from '@/lib/firebase/firestore';
import { uploadMultipleImages } from '@/lib/firebase/storage';
import { Product } from '@/types';
import Image from 'next/image';
import {
    TEXTILE_CATEGORIES,
    MATERIALS,
    GARMENT_TYPES,
    TARGET_AUDIENCE,
} from '@/lib/constants';

// --- PREMIUM CUSTOM DROPDOWN --- //
function CustomSelect({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 bg-[#F9F9FB] border rounded-2xl text-sm transition-all duration-300 ${isOpen ? 'border-[#2B2640] shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
            >
                <span className={value ? "text-slate-900 font-medium" : "text-slate-400"}>
                    {value || placeholder}
                </span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 overflow-hidden animate-in fade-in duration-200 max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full text-left px-5 py-3 text-sm transition-colors ${value === opt ? 'bg-[#F9F9FB] text-[#2B2640] font-semibold' : 'text-slate-600 hover:bg-[#F9F9FB] hover:text-[#2B2640]'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// --- MAIN PAGE COMPONENT --- //
export default function InventoryPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (user) {
            loadProducts();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadProducts = async () => {
        if (!user) return;

        try {
            const data = await getSellerProducts(user.uid);
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteProduct(productId);
            setProducts(products.filter((p) => p.id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-pulse text-lg font-medium text-slate-500">Loading inventory...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">Inventory Management</h1>
                    <p className="text-lg text-slate-500">Manage your product listings and stock</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(true);
                        setEditingProduct(null);
                    }}
                    className="px-8 py-3.5 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Product
                </button>
            </div>

            {/* Add/Edit Form Modal */}
            {(showAddForm || editingProduct) && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => {
                        setShowAddForm(false);
                        setEditingProduct(null);
                    }}
                    onSave={() => {
                        loadProducts();
                        setShowAddForm(false);
                        setEditingProduct(null);
                    }}
                    sellerId={user!.uid}
                    sellerName={user!.name}
                />
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 mb-6 bg-[#F9F9FB] rounded-full flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">No products yet</h3>
                    <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
                        You haven't added any upcycled materials to your store. Let's get started!
                    </p>
                    <button 
                        onClick={() => setShowAddForm(true)} 
                        className="px-8 py-3.5 bg-white text-[#2B2640] font-medium rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col group hover:-translate-y-1">
                            
                            {/* Product Image */}
                            <div className="relative h-48 bg-[#F9F9FB] rounded-2xl mb-5 overflow-hidden flex-shrink-0">
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
                                {product.isCutpiece && (
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-[#5F558C] text-xs font-bold rounded-lg shadow-sm">
                                        Cutpiece
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-[#5F558C] transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-slate-500 text-sm mb-5 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="space-y-2.5 text-sm mb-6 bg-[#F9F9FB] p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Material</span>
                                        <span className="font-medium text-slate-900">{product.material} • {product.color}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Dimensions</span>
                                        <span className="font-medium text-slate-900">{product.length || '?'}m × {product.width || '?'}m</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Stock</span>
                                        <span className={`font-medium ${product.quantity < 5 ? 'text-amber-600 bg-amber-50 px-2 rounded-md' : 'text-emerald-600'}`}>
                                            {product.quantity} units
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 mt-1">
                                        <span className="text-slate-500 font-medium">Price</span>
                                        <span className="font-bold text-lg text-slate-900">₹{product.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto flex gap-3">
                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="flex-1 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- PREMIUM PRODUCT FORM MODAL --- //
function ProductForm({
    product,
    onClose,
    onSave,
    sellerId,
    sellerName,
}: {
    product: Product | null;
    onClose: () => void;
    onSave: () => void;
    sellerId: string;
    sellerName: string;
}) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        material: product?.material || '',
        color: product?.color || '',
        hasPattern: product?.hasPattern || false,
        quantity: product?.quantity || 0,
        price: product?.price || 0,
        length: product?.length || 0,
        width: product?.width || 0,
        textileCategory: product?.textileCategory || '',
        idealFor: product?.idealFor || [],
        targetAudience: product?.targetAudience || [],
        isCutpiece: product?.isCutpiece || false,
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name === 'idealFor' || name === 'targetAudience') {
                const currentArray = formData[name as keyof typeof formData] as string[];
                let newArray = checked 
                    ? [...currentArray, value] 
                    : currentArray.filter((item) => item !== value);
                setFormData({ ...formData, [name]: newArray });
            } else {
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let imageUrls = product?.images || [];

            if (imageFiles.length > 0) {
                imageUrls = await uploadMultipleImages(imageFiles, sellerId);
            }

            const tags = [
                formData.textileCategory,
                formData.material,
                ...formData.idealFor,
                ...formData.targetAudience,
                formData.isCutpiece ? 'Cutpiece' : 'Regular',
            ].filter(Boolean);

            const productData = {
                ...formData,
                sellerId,
                sellerName,
                images: imageUrls,
                quantity: Number(formData.quantity),
                price: Number(formData.price),
                length: Number(formData.length),
                width: Number(formData.width),
                tags,
            };

            if (product) {
                await updateProduct(product.id, productData);
            } else {
                await createProduct(productData);
            }

            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 custom-scrollbar">
                
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-slate-900 border-l-4 border-[#2B2640] pl-3">Basic Details</h3>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Product Name *</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all" placeholder="Upcycled Denim Tote Bag" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description *</label>
                            <textarea name="description" required value={formData.description} onChange={handleChange} rows={4} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all resize-none" placeholder="Describe your product thoroughly..." />
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-medium text-slate-900 border-l-4 border-[#2B2640] pl-3">Specifications</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Material *</label>
                                <CustomSelect 
                                    options={MATERIALS} 
                                    value={formData.material} 
                                    onChange={(val) => setFormData({ ...formData, material: val })} 
                                    placeholder="Select Material" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Color *</label>
                                <input type="text" name="color" required value={formData.color} onChange={handleChange} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all" placeholder="Blue, Red, Natural..." />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Length (meters) *</label>
                                <input type="number" name="length" required min="0.1" step="0.01" value={formData.length} onChange={handleChange} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all" placeholder="1.5" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Width (meters) *</label>
                                <input type="number" name="width" required min="0.1" step="0.01" value={formData.width} onChange={handleChange} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all" placeholder="1.0" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 p-5 bg-[#F9F9FB] border border-slate-200 rounded-2xl">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" name="hasPattern" checked={formData.hasPattern} onChange={handleChange} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded md checked:bg-[#2B2640] checked:border-[#2B2640] transition-all cursor-pointer" />
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-sm font-medium text-slate-700">Has Pattern</span>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" name="isCutpiece" checked={formData.isCutpiece} onChange={handleChange} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded md checked:bg-[#2B2640] checked:border-[#2B2640] transition-all cursor-pointer" />
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-sm font-medium text-slate-700">Is Cutpiece?</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-medium text-slate-900 border-l-4 border-[#2B2640] pl-3">Categorization</h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category of Textile</label>
                            <CustomSelect 
                                options={TEXTILE_CATEGORIES} 
                                value={formData.textileCategory} 
                                onChange={(val) => setFormData({ ...formData, textileCategory: val })} 
                                placeholder="Select Category" 
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ideal For (Garment Types)</label>
                                <div className="space-y-2">
                                    {GARMENT_TYPES.map((type) => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input type="checkbox" name="idealFor" value={type} checked={(formData.idealFor as string[]).includes(type)} onChange={handleChange} className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded md checked:bg-[#2B2640] checked:border-[#2B2640] transition-all cursor-pointer" />
                                                <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Target Audience</label>
                                <div className="space-y-2">
                                    {TARGET_AUDIENCE.map((audience) => (
                                        <label key={audience} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input type="checkbox" name="targetAudience" value={audience} checked={(formData.targetAudience as string[]).includes(audience)} onChange={handleChange} className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded md checked:bg-[#2B2640] checked:border-[#2B2640] transition-all cursor-pointer" />
                                                <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{audience}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-medium text-slate-900 border-l-4 border-[#2B2640] pl-3">Inventory & Pricing</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quantity Available *</label>
                                <input type="number" name="quantity" required min="0" value={formData.quantity} onChange={handleChange} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all" placeholder="10" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price (₹) *</label>
                                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B2640]/20 focus:border-[#2B2640] transition-all" placeholder="29.99" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-medium text-slate-900 border-l-4 border-[#2B2640] pl-3">Media</h3>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Product Images {!product && '*'}</label>
                            <input type="file" accept="image/*" multiple onChange={handleImageChange} required={!product} className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-slate-200 rounded-2xl text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#EAE6F5] file:text-[#5F558C] hover:file:bg-[#D5CEEB] transition-all cursor-pointer" />
                            <p className="text-sm text-slate-400 mt-2 ml-1">Upload clear images (recommended: 3-5 images)</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-8 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-white text-slate-700 font-medium rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-[#2B2640] text-white font-medium rounded-full hover:bg-[#1E1A2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0">
                            {loading ? 'Saving...' : product ? 'Update Product' : 'Publish Product'}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Custom scrollbar styles for modal (Fixed Syntax) */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}} />
        </div>
    );
}