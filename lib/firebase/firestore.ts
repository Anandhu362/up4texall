import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    addDoc,
    Timestamp,
    WhereFilterOp,
} from 'firebase/firestore';
import { db } from './config';
import {
    Product,
    Order,
    Review,
    CartItem,
    Notification,
    ProductFilters,
} from '@/types';

// ============= PRODUCTS =============

export const createProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'products'), JSON.parse(JSON.stringify({
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    })));
    return docRef.id;
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    const docSnap = await getDoc(doc(db, 'products', productId));
    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: new Date(docSnap.data().createdAt),
        updatedAt: new Date(docSnap.data().updatedAt),
    } as Product;
};

export const getProducts = async (filters?: ProductFilters): Promise<Product[]> => {
    let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    let products: Product[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        updatedAt: new Date(doc.data().updatedAt),
    })) as Product[];

    // Apply client-side filtering
    if (filters) {
        if (filters.material) {
            products = products.filter(
                (p) => p.material.toLowerCase() === filters.material!.toLowerCase()
            );
        }
        if (filters.color) {
            products = products.filter(
                (p) => p.color.toLowerCase() === filters.color!.toLowerCase()
            );
        }
        if (filters.hasPattern !== undefined) {
            products = products.filter((p) => p.hasPattern === filters.hasPattern);
        }
        if (filters.minPrice !== undefined) {
            products = products.filter((p) => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            products = products.filter((p) => p.price <= filters.maxPrice!);
        }
        if (filters.searchQuery) {
            const searchLower = filters.searchQuery.toLowerCase();
            products = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower)
            );
        }
    }

    return products;
};

export const getSellerProducts = async (sellerId: string): Promise<Product[]> => {
    const q = query(
        collection(db, 'products'),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        updatedAt: new Date(doc.data().updatedAt),
    })) as Product[];
};

export const updateProduct = async (
    productId: string,
    data: Partial<Product>
): Promise<void> => {
    await updateDoc(doc(db, 'products', productId), JSON.parse(JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString(),
    })));
};

export const deleteProduct = async (productId: string): Promise<void> => {
    await deleteDoc(doc(db, 'products', productId));
};

// ============= CART =============

export const getCart = async (userId: string): Promise<CartItem[]> => {
    const docSnap = await getDoc(doc(db, 'carts', userId));
    if (!docSnap.exists()) return [];

    const cartData = docSnap.data();
    return cartData.items || [];
};

export const updateCart = async (
    userId: string,
    items: CartItem[]
): Promise<void> => {
    await setDoc(doc(db, 'carts', userId), {
        items,
        updatedAt: new Date().toISOString(),
    });
};

export const addToCart = async (
    userId: string,
    productId: string,
    quantity: number = 1
): Promise<void> => {
    const cart = await getCart(userId);
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    await updateCart(userId, cart);
};

export const removeFromCart = async (
    userId: string,
    productId: string
): Promise<void> => {
    const cart = await getCart(userId);
    const updatedCart = cart.filter((item) => item.productId !== productId);
    await updateCart(userId, updatedCart);
};

export const clearCart = async (userId: string): Promise<void> => {
    await updateCart(userId, []);
};

// ============= ORDERS =============

export const createOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'orders'), JSON.parse(JSON.stringify({
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    })));
    return docRef.id;
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
    const docSnap = await getDoc(doc(db, 'orders', orderId));
    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: new Date(docSnap.data().createdAt),
        updatedAt: new Date(docSnap.data().updatedAt),
    } as Order;
};

export const getBuyerOrders = async (buyerId: string): Promise<Order[]> => {
    const q = query(
        collection(db, 'orders'),
        where('buyerId', '==', buyerId),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        updatedAt: new Date(doc.data().updatedAt),
    })) as Order[];
};

export const getSellerOrders = async (sellerId: string): Promise<Order[]> => {
    const q = query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        updatedAt: new Date(doc.data().updatedAt),
    })) as Order[];
};

export const updateOrderStatus = async (
    orderId: string,
    status: Order['status']
): Promise<void> => {
    await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString(),
    });
};

// ============= REVIEWS =============

export const createReview = async (
    reviewData: Omit<Review, 'id' | 'createdAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'reviews'), JSON.parse(JSON.stringify({
        ...reviewData,
        createdAt: new Date().toISOString(),
    })));

    // Update product average rating
    await updateProductRating(reviewData.productId);

    return docRef.id;
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
    const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
    })) as Review[];
};

const updateProductRating = async (productId: string): Promise<void> => {
    const reviews = await getProductReviews(productId);
    const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await updateDoc(doc(db, 'products', productId), {
        averageRating: averageRating || 0,
        reviewCount: reviews.length,
    });
};

// ============= WISHLIST =============

export const getWishlist = async (userId: string): Promise<string[]> => {
    const docSnap = await getDoc(doc(db, 'wishlists', userId));
    if (!docSnap.exists()) return [];

    return docSnap.data().productIds || [];
};

export const addToWishlist = async (
    userId: string,
    productId: string
): Promise<void> => {
    const wishlist = await getWishlist(userId);
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        await setDoc(doc(db, 'wishlists', userId), {
            productIds: wishlist,
            updatedAt: new Date().toISOString(),
        });
    }
};

export const removeFromWishlist = async (
    userId: string,
    productId: string
): Promise<void> => {
    const wishlist = await getWishlist(userId);
    const updatedWishlist = wishlist.filter((id) => id !== productId);
    await setDoc(doc(db, 'wishlists', userId), {
        productIds: updatedWishlist,
        updatedAt: new Date().toISOString(),
    });
};

// ============= NOTIFICATIONS =============

export const createNotification = async (
    notificationData: Omit<Notification, 'id' | 'createdAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'notifications'), JSON.parse(JSON.stringify({
        ...notificationData,
        createdAt: new Date().toISOString(),
    })));
    return docRef.id;
};

export const getUserNotifications = async (
    userId: string
): Promise<Notification[]> => {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
    })) as Notification[];
};

export const markNotificationAsRead = async (
    notificationId: string
): Promise<void> => {
    await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
    });
};

export const markAllNotificationsAsRead = async (
    userId: string
): Promise<void> => {
    const notifications = await getUserNotifications(userId);
    const unreadNotifications = notifications.filter((n) => !n.read);

    await Promise.all(
        unreadNotifications.map((n) => markNotificationAsRead(n.id))
    );
};

// ============= AI USAGE TRACKING =============

export const checkAndRecordAIGeneration = async (userId: string): Promise<boolean> => {
    const usageRef = doc(db, 'ai_usage', userId);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    try {
        const docSnap = await getDoc(usageRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const timestamps: number[] = data.timestamps || [];

            // Filter to keep only timestamps from the last 24 hours
            const recentTimestamps = timestamps.filter((t: number) => now - t < oneDayMs);

            // Check if limit is reached
            if (recentTimestamps.length >= 3) {
                return false; // Limit exceeded
            }

            // Add the new timestamp and update Firestore
            recentTimestamps.push(now);
            await updateDoc(usageRef, { timestamps: recentTimestamps });
            return true; // Allowed
        } else {
            // First time user is generating, create the document
            await setDoc(usageRef, { timestamps: [now] });
            return true; // Allowed
        }
    } catch (error) {
        console.error("Error checking AI generation limit:", error);
        return false; 
    }
};