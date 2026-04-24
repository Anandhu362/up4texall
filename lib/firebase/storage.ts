import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { storage } from './config';

export const uploadProductImage = async (
    file: File,
    sellerId: string
): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `products/${sellerId}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};

export const uploadMultipleImages = async (
    files: File[],
    sellerId: string
): Promise<string[]> => {
    const uploadPromises = files.map((file) => uploadProductImage(file, sellerId));
    return Promise.all(uploadPromises);
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};
