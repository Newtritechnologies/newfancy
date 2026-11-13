import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal, CartDrawer, CompareModal } from './components/CartAndModals';
import { CategoriesView, ProductsCatalogView } from './components/CatalogView';
import { AccountView, CheckoutView } from './components/CheckoutAndAccountViews';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AboutView, ContactView, OffersView } from './components/InfoAndOffersViews';
import { Navbar } from './components/Navbar';
import { ProductDetailView } from './components/ProductDetailView';
import { RollingPageWrapper } from './components/RollingTransition';

function SupermarketShell() {
  const { route, selectedCategory, selectedProductId, navigationTick, toasts, loading } =
    useStore();

  const pageKey = `${route}-${selectedCategory}-${selectedProductId || 'none'}-${navigationTick}`;

  const renderRoute = () => {
    switch (route) {
      case 'categories':
        return <CategoriesView />;
      case 'products':
        return <ProductsCatalogView />;
      case 'product':
        return <ProductDetailView />;
      case 'offers':
        return <OffersView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'checkout':
        return <CheckoutView />;
      case 'account':
        return <AccountView />;
      case 'admin':
        return <AdminDashboard />;
      case 'home':
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] dark:bg-[#09120E] text-[#0F172A] dark:text-[#ECFDF5] transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-200/70 dark:bg-emerald-950/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <RollingPageWrapper pageKey={pageKey}>{renderRoute()}</RollingPageWrapper>
        )}
      </main>

      <Footer />

      <CartDrawer />
      <CompareModal />
      <AuthModal />

      {/* Animated Action Toasts */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 18, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.92 }}
              className="pointer-events-auto rounded-xl bg-[#0A1612] text-white border border-emerald-800/80 shadow-xl px-4 py-3 min-w-[240px]"
            >
              <p className="font-heading font-semibold text-xs text-[#FDE68A]">{toast.title}</p>
              {toast.detail && <p className="text-xs text-emerald-100/85 mt-0.5">{toast.detail}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <SupermarketShell />
    </StoreProvider>
  );
}
