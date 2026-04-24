import { useState } from 'react';
import { classifyGarments } from '@/lib/api/classifier';
import { CartItem, Product, GarmentClassificationResult } from '@/types';

export function useCartClassifier() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GarmentClassificationResult | null>(null);

    const classifyAndNotify = async (cartItems: (CartItem & { product: Product })[]) => {
        setLoading(true);
        try {
            const classification = await classifyGarments(cartItems);
            setResult(classification);

            // Store in localStorage for Cart page
            localStorage.setItem('latest_classification', JSON.stringify(classification));

            // Create notification message
            if (classification.status === 'success' && classification.results.single_garment_results.length > 0) {
                const bestOption = classification.results.single_garment_results[0];
                const message = `♻️ Recommendation: Make ${bestOption.copies} ${bestOption.garment}(s) (${bestOption.size})! Efficiency: ${bestOption.total_util_pct}%`;
                return message;
            }
            return 'No specific recommendations found.';
        } catch (error) {
            console.error('Classification failed:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { classifyAndNotify, loading, result };
}
