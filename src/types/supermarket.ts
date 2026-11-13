export type DepartmentName =
  | 'Groceries & Staples'
  | 'Fruits & Vegetables'
  | 'Dairy & Bakery'
  | 'Snacks & Beverages'
  | 'Personal Care'
  | 'Household Essentials'
  | 'Baby Care'
  | 'Beauty & Cosmetics'
  | 'Kitchen & Home'
  | 'Electronics & Accessories'
  | 'Stationery'
  | 'Frozen & Packaged Foods';

export interface SupermarketCategory {
  id: string;
  name: DepartmentName;
  slug: string;
  description: string;
  image: string;
  accentLabel: string;
  subcategories: string[];
  productCount: number;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface SupermarketProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: DepartmentName;
  subcategory: string;
  brand: string;
  weight: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  offerLabel?: string;
  description: string;
  specifications: Record<string, string>;
  image: string;
  stock: number;
  popularity: number;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  isTodayDeal: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isDailyEssential: boolean;
  isRecommended: boolean;
  gstPercent: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: SupermarketProduct;
}

export interface CustomerAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface SupermarketUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  wishlist: string[];
  addresses: CustomerAddress[];
  createdAt: string;
}

export interface CouponItem {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  active: boolean;
  expiryDate: string;
}

export type OrderStatus =
  | 'Confirmed'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItemSnapshot {
  productId: string;
  sku: string;
  name: string;
  category: DepartmentName;
  brand: string;
  weight: string;
  image: string;
  unitPrice: number;
  quantity: number;
  gstPercent: number;
  lineTotal: number;
}

export interface SupermarketOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: CustomerAddress;
  deliverySlot: string;
  paymentMethod: 'UPI' | 'Google Pay' | 'PhonePe' | 'Card' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending COD';
  status: OrderStatus;
  couponCode?: string;
  subtotal: number;
  couponDiscount: number;
  gstAmount: number;
  deliveryFee: number;
  totalAmount: number;
  items: OrderItemSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiry {
  id: string;
  referenceCode: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  createdAt: string;
}

export interface StoreDatabase {
  catalogVersion: string;
  categories: SupermarketCategory[];
  products: SupermarketProduct[];
  users: SupermarketUser[];
  carts: Record<string, CartItem[]>;
  orders: SupermarketOrder[];
  coupons: CouponItem[];
  newsletter: string[];
  inquiries: ContactInquiry[];
}

export type ActiveRoute =
  | 'home'
  | 'categories'
  | 'products'
  | 'product'
  | 'offers'
  | 'about'
  | 'contact'
  | 'checkout'
  | 'account'
  | 'admin';

export const SUPERMARKET_BACKGROUNDS = {
  heroMain: '/store-images/sm_bg_hero_fresh_1794556236026.jpg',
  heroAisle: '/store-images/sm_hero_aisle_1794553377759.jpg',
  offersPavilion: '/store-images/sm_bg_offers_pavilion_1794556236949.jpg',
  aboutContact: '/store-images/sm_bg_about_contact_1794556237139.jpg',
  harvestPromo: '/store-images/sm_promo_harvest_1794553379187.jpg',
  freshFruits: '/store-images/sm_sub_fruits_1794553382804.jpg',
  freshBakery: '/store-images/sm_sub_bakery_1794553383634.jpg',
  wholeSpices: '/store-images/sm_sub_spices_1794553382203.jpg',
  teaCoffee: '/store-images/sm_sub_tea_coffee_1794553382924.jpg',
} as const;
