import crypto from 'node:crypto';
import {
  buildDefaultCoupons,
  buildUniqueSupermarketProducts,
  SUPERMARKET_CATEGORIES,
} from '../data/supermarketCatalog.js';
import type {
  StoreDatabase,
  SupermarketOrder,
  SupermarketProduct,
  SupermarketUser,
} from '../types/supermarket.js';

export const CATALOG_VERSION = '2026.11.unique-24';

export { buildDefaultCoupons, buildUniqueSupermarketProducts, SUPERMARKET_CATEGORIES };

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function buildDefaultUsers(): SupermarketUser[] {
  return [
    {
      id: 'usr-customer-1',
      name: 'Priya Nair',
      email: 'priya@ravisupermarket.in',
      phone: '+91 98401 44510',
      passwordHash: hashPassword('customer123'),
      role: 'customer',
      wishlist: ['prod-basmati-rice', 'prod-alphonso-mango', 'prod-coffee-beans'],
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          fullName: 'Priya Nair',
          phone: '+91 98401 44510',
          line1: '14 Lotus Avenue, Block C',
          area: 'Anna Nagar East',
          city: 'Chennai',
          pincode: '600102',
          isDefault: true,
        },
      ],
      createdAt: '2026-06-15T09:00:00.000Z',
    },
    {
      id: 'usr-admin-1',
      name: 'Ravi Store Operations',
      email: 'admin@ravisupermarket.in',
      phone: '+91 98400 77880',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      wishlist: [],
      addresses: [],
      createdAt: '2026-01-10T08:00:00.000Z',
    },
  ];
}

export function buildSampleOrders(products: SupermarketProduct[]): SupermarketOrder[] {
  const first = products[0];
  const third = products[2];
  if (!first || !third) return [];
  const line1 = first.price * 1;
  const line2 = third.price * 2;
  const subtotal = line1 + line2;
  const gstAmount = Math.round((line1 * first.gstPercent) / 100);
  return [
    {
      id: 'ord-sample-1001',
      orderNumber: 'RSM-2026-1042',
      userId: 'usr-customer-1',
      customerName: 'Priya Nair',
      customerEmail: 'priya@ravisupermarket.in',
      customerPhone: '+91 98401 44510',
      address: {
        id: 'addr-1',
        label: 'Home',
        fullName: 'Priya Nair',
        phone: '+91 98401 44510',
        line1: '14 Lotus Avenue, Block C',
        area: 'Anna Nagar East',
        city: 'Chennai',
        pincode: '600102',
      },
      deliverySlot: 'Express 45 Min Delivery',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      status: 'Out for Delivery',
      couponCode: 'FRESH10',
      subtotal,
      couponDiscount: Math.round(subtotal * 0.1),
      gstAmount,
      deliveryFee: 0,
      totalAmount: subtotal - Math.round(subtotal * 0.1) + gstAmount,
      items: [
        {
          productId: first.id,
          sku: first.sku,
          name: first.name,
          category: first.category,
          brand: first.brand,
          weight: first.weight,
          image: first.image,
          unitPrice: first.price,
          quantity: 1,
          gstPercent: first.gstPercent,
          lineTotal: line1,
        },
        {
          productId: third.id,
          sku: third.sku,
          name: third.name,
          category: third.category,
          brand: third.brand,
          weight: third.weight,
          image: third.image,
          unitPrice: third.price,
          quantity: 2,
          gstPercent: third.gstPercent,
          lineTotal: line2,
        },
      ],
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

export function buildInitialDatabase(): StoreDatabase {
  const products = buildUniqueSupermarketProducts();
  return {
    catalogVersion: CATALOG_VERSION,
    categories: SUPERMARKET_CATEGORIES,
    products,
    users: buildDefaultUsers(),
    carts: {},
    orders: buildSampleOrders(products),
    coupons: buildDefaultCoupons(),
    newsletter: [],
    inquiries: [],
  };
}
