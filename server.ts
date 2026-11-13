import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  computeSalesReport,
  createOrderRecord,
  findOrder,
  getPersistenceMode,
  getProductById,
  initDatabase,
  listCategories,
  listOrders,
  listProducts,
  removeCategory,
  removeProduct,
  updateOrderStatusRecord,
  upsertCategory,
  upsertProduct,
  UPLOADS_DIR,
} from './src/server/db.ts';
import type {
  CategoryItem,
  CustomerDetails,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
} from './src/types/store.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || 'ravi-admin-2026';
const SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() || 'ravi-fancy-store-dev-session-secret';

function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 24,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token?: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) result[k] = decodeURIComponent(v.join('='));
  }
  return result;
}

function extractAdminToken(req: Request): string | undefined {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies.ravi_admin_session;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractAdminToken(req);
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  next();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.use(
    '/store-images',
    express.static(path.resolve(process.cwd(), 'dist/store-images'))
  );
  app.use(
    '/store-images',
    express.static(path.resolve(process.cwd(), 'public/store-images'))
  );
  app.use(
    '/store-images',
    express.static(path.resolve(process.cwd(), 'src/assets/images'))
  );
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      store: 'RAVI FANCY STORE',
      database: getPersistenceMode(),
      razorpayMode: process.env.RAZORPAY_KEY_ID ? 'live-test' : 'simulator-test',
    });
  });

  app.get('/api/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await listCategories();
      res.json({ categories });
    } catch (err) {
      res.status(500).json({ error: 'Unable to fetch categories' });
    }
  });

  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      let products = await listProducts();
      const category = String(req.query.category || '').trim();
      const search = String(req.query.search || '').trim().toLowerCase();
      const sort = String(req.query.sort || 'popularity').trim();

      if (category && category !== 'All') {
        products = products.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (search) {
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            p.material.toLowerCase().includes(search)
        );
      }

      if (sort === 'price-asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'discount') {
        products.sort((a, b) => b.discountPercent - a.discountPercent);
      } else {
        products.sort((a, b) => b.popularity - a.popularity);
      }

      res.json({ products });
    } catch {
      res.status(500).json({ error: 'Unable to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const product = await getProductById(String(req.params.id));
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      const all = await listProducts();
      const related = all
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 4);
      res.json({ product, related });
    } catch {
      res.status(500).json({ error: 'Unable to fetch product' });
    }
  });

  app.post('/api/payments/razorpay/create-order', async (req: Request, res: Response) => {
    try {
      const amountInRupees = Number(req.body?.amount || 0);
      if (!amountInRupees || amountInRupees <= 0) {
        res.status(400).json({ error: 'Valid payable amount is required' });
        return;
      }
      const amountPaise = Math.round(amountInRupees * 100);
      const keyId = process.env.RAZORPAY_KEY_ID?.trim();
      const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

      if (keyId && keySecret) {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: 'INR',
            receipt: `rfs_${Date.now()}`,
          }),
        });
        if (rpRes.ok) {
          const data = (await rpRes.json()) as { id: string; amount: number; currency: string };
          res.json({
            mode: 'razorpay_api',
            keyId,
            orderId: data.id,
            amount: data.amount,
            currency: data.currency,
          });
          return;
        }
      }

      const simulatedOrderId = `order_test_${crypto.randomBytes(6).toString('hex')}`;
      res.json({
        mode: 'razorpay_test_sandbox',
        keyId: 'rzp_test_raviFancyStore',
        orderId: simulatedOrderId,
        amount: amountPaise,
        currency: 'INR',
      });
    } catch {
      res.status(500).json({ error: 'Unable to initialize Razorpay test order' });
    }
  });

  app.post('/api/payments/razorpay/verify', (req: Request, res: Response) => {
    const orderId = String(req.body?.razorpayOrderId || '');
    const paymentId =
      String(req.body?.razorpayPaymentId || '') ||
      `pay_test_${crypto.randomBytes(6).toString('hex')}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const signature = String(req.body?.razorpaySignature || '');

    if (keySecret && signature && orderId) {
      const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      if (expected !== signature) {
        res.status(400).json({ verified: false, error: 'Payment signature mismatch' });
        return;
      }
    }

    res.json({
      verified: true,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        customer?: CustomerDetails;
        items?: { productId: string; quantity: number }[];
        paymentMethod?: PaymentMethod;
        promoCode?: string;
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
      };

      const customer = body.customer;
      if (
        !customer?.fullName?.trim() ||
        !customer?.phone?.trim() ||
        !customer?.addressLine1?.trim() ||
        !customer?.city?.trim() ||
        !customer?.pincode?.trim()
      ) {
        res.status(400).json({ error: 'Please complete all required delivery details.' });
        return;
      }

      if (!Array.isArray(body.items) || body.items.length === 0) {
        res.status(400).json({ error: 'Cart cannot be empty.' });
        return;
      }

      const catalog = await listProducts();
      const resolvedItems: OrderItem[] = [];
      let subtotal = 0;

      for (const reqItem of body.items) {
        const prod = catalog.find((p) => p.id === reqItem.productId);
        if (!prod) {
          res.status(400).json({ error: `Product ${reqItem.productId} is no longer available.` });
          return;
        }
        const qty = Math.max(1, Math.floor(Number(reqItem.quantity) || 1));
        if (prod.stock < qty) {
          res.status(400).json({
            error: `Only ${prod.stock} unit(s) remaining for ${prod.name}.`,
          });
          return;
        }
        resolvedItems.push({
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          image: prod.images[0] || '/store-images/cat_necklaces_1794550860428.jpg',
          price: prod.price,
          quantity: qty,
        });
        subtotal += prod.price * qty;
      }

      const promo = body.promoCode?.trim().toUpperCase();
      let discountAmount = 0;
      if (promo === 'RAVI10' && subtotal >= 999) {
        discountAmount = Math.round(subtotal * 0.1);
      } else if (promo === 'BRIDAL15' && subtotal >= 2499) {
        discountAmount = Math.round(subtotal * 0.15);
      }

      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const shippingFee = discountedSubtotal >= 799 ? 0 : 60;
      const totalAmount = discountedSubtotal + shippingFee;
      const paymentMethod: PaymentMethod = body.paymentMethod || 'UPI';

      const paymentStatus =
        paymentMethod === 'Cash on Delivery'
          ? 'Pending COD'
          : paymentMethod === 'Razorpay Test'
            ? 'Test Verified'
            : 'Paid';

      const now = new Date().toISOString();
      const shortNum = Math.floor(1000 + Math.random() * 9000);
      const order: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `RFS-2026-${shortNum}`,
        customer,
        items: resolvedItems,
        subtotal,
        discountAmount,
        promoCode: discountAmount > 0 ? promo : undefined,
        shippingFee,
        totalAmount,
        paymentMethod,
        paymentStatus,
        razorpayOrderId: body.razorpayOrderId,
        razorpayPaymentId: body.razorpayPaymentId,
        status: 'Confirmed',
        statusHistory: [
          {
            status: 'Pending',
            timestamp: now,
            note: `Order received via ${paymentMethod}`,
          },
          {
            status: 'Confirmed',
            timestamp: now,
            note:
              paymentMethod === 'Cash on Delivery'
                ? 'Cash on Delivery verified & queued for boutique packing'
                : `${paymentMethod} payment confirmed`,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const saved = await createOrderRecord(order);
      res.status(201).json({ order: saved });
    } catch {
      res.status(500).json({ error: 'Unable to place order at this moment.' });
    }
  });

  app.get('/api/orders/track/:query', async (req: Request, res: Response) => {
    try {
      const orders = await findOrder(String(req.params.query || ''));
      res.json({ orders });
    } catch {
      res.status(500).json({ error: 'Unable to track order' });
    }
  });

  // Admin Authentication
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const password = String(req.body?.password || '');
    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Invalid admin password.' });
      return;
    }
    const token = createSessionToken();
    res.setHeader(
      'Set-Cookie',
      `ravi_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );
    res.json({ authenticated: true, token });
  });

  app.post('/api/admin/logout', (_req: Request, res: Response) => {
    res.setHeader(
      'Set-Cookie',
      'ravi_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    );
    res.json({ authenticated: false });
  });

  app.get('/api/admin/me', (req: Request, res: Response) => {
    const token = extractAdminToken(req);
    res.json({ authenticated: verifySessionToken(token) });
  });

  // Admin Image Upload (base64 payload saved to /data/uploads)
  app.post('/api/admin/upload', requireAdmin, async (req: Request, res: Response) => {
    try {
      const fileName = String(req.body?.fileName || 'product.jpg');
      const dataUrl = String(req.body?.dataUrl || '');
      const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
      if (!match) {
        res.status(400).json({ error: 'Only PNG, JPG, or WebP images are supported.' });
        return;
      }
      const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
      const base = slugify(path.parse(fileName).name) || 'product';
      const safeName = `${base}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(match[2], 'base64');
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOADS_DIR, safeName), buffer);
      res.status(201).json({ url: `/uploads/${safeName}` });
    } catch {
      res.status(500).json({ error: 'Failed to save uploaded image.' });
    }
  });

  // Admin Product CRUD
  app.post('/api/admin/products', requireAdmin, async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<Product>;
      if (!body.name?.trim() || !body.category?.trim() || !body.price) {
        res.status(400).json({ error: 'Product name, category, and price are required.' });
        return;
      }
      const price = Math.max(1, Number(body.price));
      const originalPrice = Math.max(price, Number(body.originalPrice || price));
      const discountPercent =
        originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : Number(body.discountPercent || 0);

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: body.name.trim(),
        slug: slugify(body.name),
        category: body.category.trim(),
        price,
        originalPrice,
        discountPercent,
        offerLabel: body.offerLabel?.trim() || (discountPercent > 0 ? `${discountPercent}% Off` : 'Boutique Pick'),
        description: body.description?.trim() || 'Handpicked ladies boutique accessory from RAVI FANCY STORE.',
        material: body.material?.trim() || 'Artisan Finish',
        careInstructions: body.careInstructions?.trim() || 'Store dry in lined box.',
        images:
          Array.isArray(body.images) && body.images.length > 0
            ? body.images
            : ['/store-images/cat_necklaces_1794550860428.jpg'],
        stock: Math.max(0, Number(body.stock ?? 20)),
        popularity: Number(body.popularity ?? 85),
        rating: Number(body.rating ?? 4.8),
        reviewCount: Number(body.reviewCount ?? 1),
        isTrending: Boolean(body.isTrending),
        isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : true,
        createdAt: new Date().toISOString(),
      };

      const saved = await upsertProduct(newProduct);
      res.status(201).json({ product: saved });
    } catch {
      res.status(500).json({ error: 'Unable to create product.' });
    }
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const existing = await getProductById(id);
      if (!existing) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }
      const body = req.body as Partial<Product>;
      const price = body.price !== undefined ? Math.max(1, Number(body.price)) : existing.price;
      const originalPrice =
        body.originalPrice !== undefined
          ? Math.max(price, Number(body.originalPrice))
          : Math.max(price, existing.originalPrice);
      const discountPercent =
        originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      const updated: Product = {
        ...existing,
        ...body,
        id: existing.id,
        name: body.name?.trim() || existing.name,
        slug: body.name ? slugify(body.name) : existing.slug,
        price,
        originalPrice,
        discountPercent,
        stock: body.stock !== undefined ? Math.max(0, Number(body.stock)) : existing.stock,
      };
      const saved = await upsertProduct(updated);
      res.json({ product: saved });
    } catch {
      res.status(500).json({ error: 'Unable to update product.' });
    }
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await removeProduct(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }
      res.json({ deleted: true });
    } catch {
      res.status(500).json({ error: 'Unable to delete product.' });
    }
  });

  // Admin Category CRUD
  app.post('/api/admin/categories', requireAdmin, async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<CategoryItem>;
      if (!body.name?.trim()) {
        res.status(400).json({ error: 'Category name is required.' });
        return;
      }
      const existing = await listCategories();
      const item: CategoryItem = {
        id: body.id || `cat-${slugify(body.name)}-${Date.now()}`,
        name: body.name.trim(),
        slug: slugify(body.name),
        description: body.description?.trim() || 'Curated RAVI FANCY STORE collection.',
        image: body.image?.trim() || '/store-images/cat_necklaces_1794550860428.jpg',
        featuredOrder: Number(body.featuredOrder ?? existing.length + 1),
      };
      const saved = await upsertCategory(item);
      res.status(201).json({ category: saved });
    } catch {
      res.status(500).json({ error: 'Unable to save category.' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await removeCategory(String(req.params.id));
      res.json({ deleted });
    } catch {
      res.status(500).json({ error: 'Unable to delete category.' });
    }
  });

  // Admin Orders & Sales Reports
  app.get('/api/admin/orders', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const orders = await listOrders();
      res.json({ orders });
    } catch {
      res.status(500).json({ error: 'Unable to fetch orders.' });
    }
  });

  app.patch('/api/admin/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.body?.status as OrderStatus;
      const validStatuses: OrderStatus[] = [
        'Pending',
        'Confirmed',
        'Packed',
        'Shipped',
        'Delivered',
        'Cancelled',
      ];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid order status.' });
        return;
      }
      const updated = await updateOrderStatusRecord(
        String(req.params.id),
        status,
        req.body?.note ? String(req.body.note) : undefined
      );
      if (!updated) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      res.json({ order: updated });
    } catch {
      res.status(500).json({ error: 'Unable to update order status.' });
    }
  });

  app.get('/api/admin/reports', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const report = await computeSalesReport();
      res.json({ report });
    } catch {
      res.status(500).json({ error: 'Unable to compute sales report.' });
    }
  });

  // Vite integration in dev / Static dist in production or npm start
  const isProdMode =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start';

  if (!isProdMode) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAVI FANCY STORE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
