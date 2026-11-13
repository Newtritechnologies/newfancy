import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  GitCompareArrows,
  Heart,
  MapPin,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sun,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import type { ActiveRoute } from '../types/supermarket';
import { formatINR } from '../utils/currency';
import { RollingCounter } from './RollingTransition';

const PRIMARY_NAV: { label: string; route: ActiveRoute }[] = [
  { label: 'Home', route: 'home' },
  { label: 'Categories', route: 'categories' },
  { label: 'Products', route: 'products' },
  { label: 'Offers', route: 'offers' },
  { label: 'Contact', route: 'contact' },
];

export function Navbar() {
  const {
    route,
    setRoute,
    navigateToProduct,
    searchQuery,
    setSearchQuery,
    deliveryArea,
    setDeliveryArea,
    deliverySlot,
    setDeliverySlot,
    products,
    cartCount,
    wishlist,
    compareIds,
    user,
    darkMode,
    toggleDarkMode,
    setCartOpen,
    setCompareOpen,
    setAuthOpen,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, products]);

  const handleNavClick = (target: ActiveRoute) => {
    setMobileMenuOpen(false);
    setRoute(target, target === 'products' ? { category: 'All' } : undefined);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    setRoute('products', { category: 'All' });
  };

  return (
    <>
      {/* Strict 3-Zone Top Bar (sticky h-16, well within mobile 15% cap) */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#09120E]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-emerald-950/80 transition-colors">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#064E3B] dark:text-[#ECFDF5] whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>RAVI SUPERMARKET</span>
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-heading font-medium text-slate-600 dark:text-emerald-100/75">
            {PRIMARY_NAV.map((item) => {
              const active =
                route === item.route || (item.route === 'products' && route === 'product');
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`relative py-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    active
                      ? 'text-[#047857] dark:text-[#34D399]'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="ravi-nav-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#047857] dark:bg-[#34D399] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action CTA + Mobile drawer toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Basket</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[#FDE68A] font-mono text-xs tabular-nums">
                <RollingCounter value={cartCount} />
              </span>
            </motion.button>

            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 dark:border-emerald-900 flex items-center justify-center text-slate-700 dark:text-emerald-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-[#0C1914] border-b border-slate-200 dark:border-emerald-900 shadow-xl px-5 py-4 space-y-2 z-50"
            >
              {[
                ...PRIMARY_NAV,
                { label: 'About Us', route: 'about' as ActiveRoute },
                { label: 'Account & Orders', route: 'account' as ActiveRoute },
                { label: 'Store Admin', route: 'admin' as ActiveRoute },
              ].map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-heading font-medium cursor-pointer transition-colors ${
                    route === item.route
                      ? 'bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#047857] dark:text-[#34D399]'
                      : 'text-slate-700 dark:text-emerald-100 hover:bg-slate-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Scrollable Sub-Header Store Utility Bar: Search Autocomplete, Location Selector, Theme, Account & Admin */}
      <div className="bg-[#F1F5F0] dark:bg-[#0D1A14] border-b border-slate-200/70 dark:border-emerald-950/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Delivery Area & Slot Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-emerald-200/80">
            <MapPin className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399] shrink-0" />
            <div className="relative flex items-center">
              <select
                aria-label="Select delivery neighbourhood"
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                className="appearance-none bg-transparent pr-5 font-medium text-slate-800 dark:text-emerald-100 focus:outline-none cursor-pointer"
              >
                <option value="Anna Nagar · 600040" className="dark:bg-[#0D1A14]">
                  Anna Nagar · 600040
                </option>
                <option value="Adyar · 600020" className="dark:bg-[#0D1A14]">
                  Adyar · 600020
                </option>
                <option value="T. Nagar · 600017" className="dark:bg-[#0D1A14]">
                  T. Nagar · 600017
                </option>
                <option value="Velachery · 600042" className="dark:bg-[#0D1A14]">
                  Velachery · 600042
                </option>
              </select>
              <ChevronDown className="w-3 h-3 -ml-4 pointer-events-none opacity-60" />
            </div>
            <span aria-hidden="true" className="text-slate-300 dark:text-emerald-800">
              |
            </span>
            <select
              aria-label="Select delivery slot"
              value={deliverySlot}
              onChange={(e) => setDeliverySlot(e.target.value)}
              className="hidden sm:inline-block bg-transparent font-medium text-[#047857] dark:text-[#34D399] focus:outline-none cursor-pointer"
            >
              <option value="Express 45 Min Delivery" className="dark:bg-[#0D1A14]">
                Express 45 Min
              </option>
              <option value="Morning (07:00 – 09:00)" className="dark:bg-[#0D1A14]">
                Morning 07:00 – 09:00
              </option>
              <option value="Evening (17:00 – 20:00)" className="dark:bg-[#0D1A14]">
                Evening 17:00 – 20:00
              </option>
            </select>
          </div>

          {/* Search with live autocomplete */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] max-w-md">
            <div className="flex items-center rounded-xl bg-white dark:bg-[#13251D] border border-slate-200 dark:border-emerald-900/60 px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#047857]/30">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unique products, olive oil, sourdough, mangoes..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-emerald-50 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {searchFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900 shadow-2xl overflow-hidden z-50"
                >
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchFocused(false);
                        navigateToProduct(p.id);
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center gap-3 text-left hover:bg-[#ECFDF5] dark:hover:bg-emerald-950/60 transition-colors cursor-pointer border-b border-slate-100 dark:border-emerald-950/50 last:border-b-0"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-200/60 truncate">
                          {p.category} · {p.weight}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#047857] dark:text-[#34D399] tabular-nums shrink-0">
                        {formatINR(p.price)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Shopper Quick Controls: About, Compare, Wishlist, Light/Dark, Account, Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`hidden md:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                route === 'about'
                  ? 'bg-[#047857]/10 text-[#047857] dark:text-[#34D399]'
                  : 'text-slate-600 dark:text-emerald-200/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Our Story
            </button>

            {compareIds.length > 0 && (
              <motion.button
                type="button"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCompareOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                <span>Compare ({compareIds.length})</span>
              </motion.button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick('account')}
              title="Wishlist & Orders"
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13251D] border border-slate-200 dark:border-emerald-900/60 text-xs font-medium text-slate-700 dark:text-emerald-100 inline-flex items-center gap-1.5 hover:border-[#047857] cursor-pointer whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span className="tabular-nums">{wishlist.length}</span>
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="w-8 h-8 rounded-lg bg-white dark:bg-[#13251D] border border-slate-200 dark:border-emerald-900/60 flex items-center justify-center text-slate-700 dark:text-amber-300 hover:border-[#047857] cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => (user ? handleNavClick('account') : setAuthOpen(true))}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#13251D] border border-slate-200 dark:border-emerald-900/60 text-xs font-medium text-slate-700 dark:text-emerald-100 inline-flex items-center gap-1.5 hover:border-[#047857] cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399]" />
              <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              title="Store Admin Dashboard"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors ${
                route === 'admin'
                  ? 'bg-[#047857] text-white border-[#047857]'
                  : 'bg-white dark:bg-[#13251D] border-slate-200 dark:border-emerald-900/60 text-slate-700 dark:text-emerald-100 hover:border-[#047857]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
