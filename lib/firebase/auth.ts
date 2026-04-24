import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updatePassword,
    updateEmail,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserRole } from '@/types';

export interface SignUpData {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
    address?: string;
    businessName?: string;
}

// Sign up new user
export const signUp = async (data: SignUpData): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        const user: User = {
            uid: userCredential.user.uid,
            email: data.email,
            name: data.name,
            role: data.role,
            phone: data.phone,
            address: data.address,
            businessName: data.businessName,
            createdAt: new Date(),
        };

        // Save user data to Firestore
        // Remove undefined fields as Firestore doesn't support them
        const userData = JSON.parse(JSON.stringify({
            ...user,
            createdAt: new Date().toISOString(),
        }));

        await setDoc(doc(db, 'users', user.uid), userData);

        return user;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign up');
    }
};

// Sign in existing user
export const signIn = async (
    email: string,
    password: string
): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (!userDoc.exists()) {
            throw new Error('User data not found');
        }

        const userData = userDoc.data();
        return {
            uid: userCredential.user.uid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            address: userData.address,
            businessName: userData.businessName,
            createdAt: new Date(userData.createdAt),
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in');
    }
};

// Sign out
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign out');
    }
};

// Get current user data
export const getCurrentUser = async (): Promise<User | null> => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
        return null;
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
        return null;
    }

    const userData = userDoc.data();
    return {
        uid: firebaseUser.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        address: userData.address,
        businessName: userData.businessName,
        createdAt: new Date(userData.createdAt),
    };
};

// Update user profile
export const updateUserProfile = async (
    uid: string,
    data: Partial<User>
): Promise<void> => {
    try {
        // Remove undefined fields
        const updateData = JSON.parse(JSON.stringify({
            ...data,
            updatedAt: new Date().toISOString(),
        }));

        await updateDoc(doc(db, 'users', uid), updateData);

        // Update email in Firebase Auth if changed
        if (data.email && auth.currentUser) {
            await updateEmail(auth.currentUser, data.email);
        }
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update profile');
    }
};

// Change password
export const changePassword = async (newPassword: string): Promise<void> => {
    try {
        if (!auth.currentUser) {
            throw new Error('No user logged in');
        }
        await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to change password');
    }
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            const user = await getCurrentUser();
            callback(user);
        } else {
            callback(null);
        }
    });
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send reset email');
    }
};
