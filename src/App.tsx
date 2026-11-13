import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer, CartEntry } from './components/CartDrawer';
import { CategoriesView } from './components/CategoriesView';
import { CheckoutView } from './components/CheckoutView';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { InfoPages } from './components/InfoPages';
import { Navbar, PageRoute } from './components/Navbar';
import { OrderTrackingView } from './components/OrderTrackingView';
import { ProductDetailView } from './components/ProductDetailView';
import { ShopView } from './components/ShopView';
import { CategoryItem, Order, Product } from './types/store';

const CART_STORAGE_KEY = 'rfs_cart_v1';
const WISHLIST_STORAGE_KEY = 'rfs_wishlist_v1';
const RECENT_ORDERS_KEY = 'rfs_recent_orders_v1';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [trackingQuery, setTrackingQuery] = useState<string>('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartEntry[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [recentOrderNumbers, setRecentOrderNumbers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_ORDERS_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const fetchStoreData = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);
      const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);
      if (Array.isArray(catData.categories)) setCategories(catData.categories);
      if (Array.isArray(prodData.products)) setProducts(prodData.products);
    } catch {
      // Keep current catalog if transient network error occurs
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(recentOrderNumbers));
  }, [recentOrderNumbers]);

  const navigate = (page: PageRoute) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    navigate('shop');
  };

  const handleViewProduct = (product: Product) => {
    setActiveProduct(product);
    navigate('product');
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        const newQty = Math.min(product.stock, next[idx].quantity + quantity);
        next[idx] = { product, quantity: newQty };
        return next;
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    setCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { product, quantity: Math.min(product.stock, next[idx].quantity + quantity) };
        return next;
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    setCartOpen(false);
    navigate('checkout');
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleOrderComplete = (order: Order) => {
    setCart([]);
    setRecentOrderNumbers((prev) =>
      [order.orderNumber, ...prev.filter((n) => n !== order.orderNumber)].slice(0, 8)
    );
    fetchStoreData();
  };

  const handleTrackOrder = (orderNumber: string) => {
    setTrackingQuery(orderNumber);
    navigate('tracking');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF8F4] text-[#2D1620]">
      <Navbar
        currentPage={currentPage}
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        onNavigate={navigate}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#EADCE2] border-t-[#6B1D3A] animate-spin mx-auto" />
            <p className="font-display text-lg text-[#6B1D3A]">
              Curating RAVI FANCY STORE showcase...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${activeProduct?.id || ''}-${selectedCategory}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentPage === 'home' && (
                <HomeView
                  categories={categories}
                  products={products}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onBuyNow={(p) => handleBuyNow(p, 1)}
                  onViewProduct={handleViewProduct}
                  onSelectCategory={handleSelectCategory}
                  onNavigate={navigate}
                />
              )}

              {currentPage === 'shop' && (
                <ShopView
                  categories={categories}
                  products={products}
                  selectedCategory={selectedCategory}
                  wishlistIds={wishlistIds}
                  onSelectCategory={setSelectedCategory}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onBuyNow={(p) => handleBuyNow(p, 1)}
                  onViewProduct={handleViewProduct}
                  onNavigate={navigate}
                />
              )}

              {currentPage === 'categories' && (
                <CategoriesView
                  categories={categories}
                  products={products}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentPage === 'product' && activeProduct && (
                <ProductDetailView
                  product={activeProduct}
                  allProducts={products}
                  wishlistIds={wishlistIds}
                  onBack={() => navigate('shop')}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onViewProduct={handleViewProduct}
                />
              )}

              {currentPage === 'checkout' && (
                <CheckoutView
                  items={cart}
                  onBackToShop={() => navigate('shop')}
                  onOrderComplete={handleOrderComplete}
                  onTrackOrder={handleTrackOrder}
                />
              )}

              {currentPage === 'tracking' && (
                <OrderTrackingView
                  initialQuery={trackingQuery}
                  localOrderIds={recentOrderNumbers}
                />
              )}

              {(currentPage === 'about' ||
                currentPage === 'contact' ||
                currentPage === 'faq' ||
                currentPage === 'privacy' ||
                currentPage === 'terms' ||
                currentPage === 'refund') && (
                <InfoPages page={currentPage} onNavigate={navigate} />
              )}

              {currentPage === 'admin' && (
                <AdminDashboard
                  categories={categories}
                  products={products}
                  onRefreshStore={fetchStoreData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer
        categories={categories}
        onNavigate={navigate}
        onSelectCategory={handleSelectCategory}
      />

      <CartDrawer
        isOpen={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setCartOpen(false);
          navigate('checkout');
        }}
        onShopNow={() => navigate('shop')}
      />
    </div>
  );
}
