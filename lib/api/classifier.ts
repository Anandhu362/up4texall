import { CartItem, GarmentClassificationResult } from '@/types';

// Pointing to your internal Next.js route instead of the external Render URL
const API_URL = '/api/classify';

export async function classifyGarments(cartItems: CartItem[]): Promise<GarmentClassificationResult> {
    try {
        // Filter out items that don't have dimensions
        const validItems = cartItems.filter(
            (item) => item.product && item.product.length && item.product.width
        );

        if (validItems.length === 0) {
            throw new Error('No items with valid dimensions in cart');
        }

        // Construct payload
        const rectangles = validItems.flatMap((item) => {
            const rects = [];
            for (let i = 0; i < item.quantity; i++) {
                rects.push({
                    length: item.product!.length!,
                    width: item.product!.width!,
                    color: item.product!.color || 'unknown',
                });
            }
            return rects;
        });

        const payload = {
            rectangles,
            include_multi: false, 
        };

        // Make the request to your internal Next.js proxy
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data as GarmentClassificationResult;
    } catch (error) {
        console.error('Garment classification error:', error);
        throw error;
    }
}