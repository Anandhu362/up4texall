import { Product } from '@/types';

export async function predictCutpiece(product: Product): Promise<any> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Prediction API called for cutpiece:', product.name);

    // Return mock result
    return {
        success: true,
        predictedGarments: ['Shirt', 'T-shirt'],
        efficiency: 85,
        message: 'This cutpiece is suitable for making a Shirt or T-shirt with 85% efficiency.',
    };
}
