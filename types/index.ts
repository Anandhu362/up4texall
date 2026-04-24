export type UserRole = 'seller' | 'buyer' | 'admin';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  businessName?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  images: string[];
  material: string;
  color: string;
  hasPattern: boolean; // New field for pattern filtering
  quantity: number;
  price: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  length?: number; // in meters
  width?: number; // in meters
  textileCategory?: string;
  idealFor?: string[];
  targetAudience?: string[];
  tags?: string[];
  isCutpiece?: boolean;
}

export interface GarmentClassificationResult {
  status: string;
  results: {
    input_rectangles: {
      length: number;
      width: number;
      color: string;
    }[];
    input_total_area_m2: number;
    single_garment_results: {
      garment: string;
      size: string;
      copies: number;
      total_util_pct: number;
      total_waste_pct: number;
      copy_details: {
        copy: number;
        avg_util_pct: number;
        color_assignment: Record<string, string>;
      }[];
      remaining_rects_count: number;
    }[];
    summary: {
      total_feasible_garments: number;
      best_single_option: any;
    };
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order_status' | 'new_review' | 'low_stock' | 'new_order';
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}

export interface ProductFilters {
  material?: string;
  color?: string;
  hasPattern?: boolean;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  textileCategory?: string;
  idealFor?: string[];
  targetAudience?: string[];
  isCutpiece?: boolean;
}
