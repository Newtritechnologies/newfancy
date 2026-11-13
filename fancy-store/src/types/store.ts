export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'UPI'
  | 'Google Pay'
  | 'PhonePe'
  | 'Razorpay Test'
  | 'Cash on Delivery';

export type PaymentStatus = 'Paid' | 'Pending COD' | 'Test Verified';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featuredOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  offerLabel: string;
  description: string;
  material: string;
  careInstructions: string;
  images: string[];
  stock: number;
  popularity: number;
  rating: number;
  reviewCount: number;
  isTrending: boolean;
  isNewArrival: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalUnitsSold: number;
  lowStockCount: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByCategory: {
    category: string;
    revenue: number;
    units: number;
  }[];
  recentOrders: Order[];
}
