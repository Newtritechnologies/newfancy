import fs from 'node:fs/promises';
import path from 'node:path';
import { type Db, MongoClient } from 'mongodb';
import type {
  CategoryItem,
  Order,
  OrderStatus,
  Product,
  SalesReport,
} from '../types/store.ts';
import { SEED_CATEGORIES, SEED_ORDERS, SEED_PRODUCTS } from './seedProducts.ts';

interface LocalStoreData {
  categories: CategoryItem[];
  products: Product[];
  orders: Order[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'ravi-fancy-store.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let mongoDb: Db | null = null;
let mongoAttempted = false;
let localCache: LocalStoreData | null = null;

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function readLocalStore(): Promise<LocalStoreData> {
  if (localCache) return localCache;
  await ensureDirs();
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as LocalStoreData;
    const existingCats = parsed.categories?.length ? parsed.categories : [...SEED_CATEGORIES];
    const existingProds = parsed.products?.length ? [...parsed.products] : [...SEED_PRODUCTS];
    let dirty = false;
    for (const seedProd of SEED_PRODUCTS) {
      if (!existingProds.some((p) => p.id === seedProd.id)) {
        existingProds.push(seedProd);
        dirty = true;
      }
    }
    localCache = {
      categories: existingCats,
      products: existingProds,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [...SEED_ORDERS],
    };
    if (dirty) {
      await writeLocalStore(localCache);
    }
    return localCache;
  } catch {
    localCache = {
      categories: [...SEED_CATEGORIES],
      products: [...SEED_PRODUCTS],
      orders: [...SEED_ORDERS],
    };
    await writeLocalStore(localCache);
    return localCache;
  }
}

async function writeLocalStore(data: LocalStoreData): Promise<void> {
  await ensureDirs();
  localCache = data;
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function initDatabase(): Promise<{ mode: 'mongodb' | 'json' }> {
  await ensureDirs();
  if (mongoDb) return { mode: 'mongodb' };

  const uri = process.env.MONGODB_URI?.trim();
  if (uri && !mongoAttempted) {
    mongoAttempted = true;
    try {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3500 });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB?.trim() || 'ravi_fancy_store');
      const catCount = await db.collection<CategoryItem>('categories').countDocuments();
      if (catCount === 0) {
        await db.collection<CategoryItem>('categories').insertMany(SEED_CATEGORIES);
      }
      const existingIds = new Set(
        (await db.collection<Product>('products').find({}, { projection: { id: 1 } }).toArray()).map(
          (p) => p.id
        )
      );
      const missingSeeds = SEED_PRODUCTS.filter((p) => !existingIds.has(p.id));
      if (missingSeeds.length > 0) {
        await db.collection<Product>('products').insertMany(missingSeeds);
      }
      const ordCount = await db.collection<Order>('orders').countDocuments();
      if (ordCount === 0) {
        await db.collection<Order>('orders').insertMany(SEED_ORDERS);
      }
      mongoDb = db;
      console.log('[DB] Connected to MongoDB for RAVI FANCY STORE');
      return { mode: 'mongodb' };
    } catch (err) {
      console.warn(
        '[DB] MongoDB unavailable, using resilient local JSON persistence:',
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  await readLocalStore();
  return { mode: 'json' };
}

export function getPersistenceMode(): 'mongodb' | 'json' {
  return mongoDb ? 'mongodb' : 'json';
}

export async function listCategories(): Promise<CategoryItem[]> {
  if (mongoDb) {
    const items = await mongoDb
      .collection<CategoryItem>('categories')
      .find({}, { projection: { _id: 0 } })
      .sort({ featuredOrder: 1 })
      .toArray();
    return items;
  }
  const data = await readLocalStore();
  return [...data.categories].sort((a, b) => a.featuredOrder - b.featuredOrder);
}

export async function upsertCategory(category: CategoryItem): Promise<CategoryItem> {
  if (mongoDb) {
    await mongoDb
      .collection<CategoryItem>('categories')
      .updateOne({ id: category.id }, { $set: category }, { upsert: true });
    return category;
  }
  const data = await readLocalStore();
  const idx = data.categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    data.categories[idx] = category;
  } else {
    data.categories.push(category);
  }
  await writeLocalStore(data);
  return category;
}

export async function removeCategory(id: string): Promise<boolean> {
  if (mongoDb) {
    const res = await mongoDb.collection<CategoryItem>('categories').deleteOne({ id });
    return res.deletedCount > 0;
  }
  const data = await readLocalStore();
  const before = data.categories.length;
  data.categories = data.categories.filter((c) => c.id !== id);
  if (data.categories.length !== before) {
    await writeLocalStore(data);
    return true;
  }
  return false;
}

export async function listProducts(): Promise<Product[]> {
  if (mongoDb) {
    return mongoDb
      .collection<Product>('products')
      .find({}, { projection: { _id: 0 } })
      .toArray();
  }
  const data = await readLocalStore();
  return [...data.products];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (mongoDb) {
    return mongoDb
      .collection<Product>('products')
      .findOne({ id }, { projection: { _id: 0 } });
  }
  const data = await readLocalStore();
  return data.products.find((p) => p.id === id) || null;
}

export async function upsertProduct(product: Product): Promise<Product> {
  if (mongoDb) {
    await mongoDb
      .collection<Product>('products')
      .updateOne({ id: product.id }, { $set: product }, { upsert: true });
    return product;
  }
  const data = await readLocalStore();
  const idx = data.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    data.products[idx] = product;
  } else {
    data.products.push(product);
  }
  await writeLocalStore(data);
  return product;
}

export async function removeProduct(id: string): Promise<boolean> {
  if (mongoDb) {
    const res = await mongoDb.collection<Product>('products').deleteOne({ id });
    return res.deletedCount > 0;
  }
  const data = await readLocalStore();
  const before = data.products.length;
  data.products = data.products.filter((p) => p.id !== id);
  if (data.products.length !== before) {
    await writeLocalStore(data);
    return true;
  }
  return false;
}

export async function listOrders(): Promise<Order[]> {
  if (mongoDb) {
    return mongoDb
      .collection<Order>('orders')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
  }
  const data = await readLocalStore();
  return [...data.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function findOrder(query: string): Promise<Order[]> {
  const normalized = query.trim().toLowerCase();
  const orders = await listOrders();
  if (!normalized) return [];
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase() === normalized ||
      o.id.toLowerCase() === normalized ||
      o.customer.phone.replace(/\s+/g, '').includes(normalized.replace(/\s+/g, '')) ||
      o.customer.email.toLowerCase() === normalized
  );
}

export async function createOrderRecord(order: Order): Promise<Order> {
  if (mongoDb) {
    for (const item of order.items) {
      await mongoDb
        .collection<Product>('products')
        .updateOne({ id: item.productId }, { $inc: { stock: -item.quantity, popularity: 1 } });
    }
    await mongoDb.collection<Order>('orders').insertOne(order);
    return order;
  }

  const data = await readLocalStore();
  for (const item of order.items) {
    const prod = data.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.popularity = Math.min(100, prod.popularity + 1);
    }
  }
  data.orders.unshift(order);
  await writeLocalStore(data);
  return order;
}

export async function updateOrderStatusRecord(
  id: string,
  status: OrderStatus,
  note?: string
): Promise<Order | null> {
  const timestamp = new Date().toISOString();
  const entry = {
    status,
    timestamp,
    note: note?.trim() || `Status updated to ${status}`,
  };

  if (mongoDb) {
    const existing = await mongoDb
      .collection<Order>('orders')
      .findOne({ id }, { projection: { _id: 0 } });
    if (!existing) return null;
    const updated: Order = {
      ...existing,
      status,
      updatedAt: timestamp,
      statusHistory: [...existing.statusHistory, entry],
    };
    await mongoDb.collection<Order>('orders').updateOne({ id }, { $set: updated });
    return updated;
  }

  const data = await readLocalStore();
  const idx = data.orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  const updated: Order = {
    ...data.orders[idx],
    status,
    updatedAt: timestamp,
    statusHistory: [...data.orders[idx].statusHistory, entry],
  };
  data.orders[idx] = updated;
  await writeLocalStore(data);
  return updated;
}

export async function computeSalesReport(): Promise<SalesReport> {
  const [orders, products] = await Promise.all([listOrders(), listProducts()]);

  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue =
    validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  let totalUnitsSold = 0;
  const catMap = new Map<string, { revenue: number; units: number }>();

  for (const order of validOrders) {
    for (const item of order.items) {
      totalUnitsSold += item.quantity;
      const existing = catMap.get(item.category) || { revenue: 0, units: 0 };
      existing.revenue += item.price * item.quantity;
      existing.units += item.quantity;
      catMap.set(item.category, existing);
    }
  }

  const ordersByStatus: Record<OrderStatus, number> = {
    Pending: 0,
    Confirmed: 0,
    Packed: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };
  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
  }

  const revenueByCategory = Array.from(catMap.entries())
    .map(([category, stats]) => ({
      category,
      revenue: stats.revenue,
      units: stats.units,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    totalUnitsSold,
    lowStockCount,
    ordersByStatus,
    revenueByCategory,
    recentOrders: orders.slice(0, 8),
  };
}
