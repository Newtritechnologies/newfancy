import React, { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { motion } from 'motion/react';

export type PageRoute =
  | 'home'
  | 'shop'
  | 'categories'
  | 'about'
  | 'contact'
  | 'product'
  | 'checkout'
  | 'tracking'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'admin';

interface NavbarProps {
  currentPage: PageRoute;
  cartCount: number;
  wishlistCount: number;
  onNavigate: (page: PageRoute) => void;
  onOpenCart: () => void;
}

const NAV_LINKS: { id: PageRoute; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'categories', label: 'Categories' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  cartCount,
  wishlistCount,
  onNavigate,
  onOpenCart,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (page: PageRoute) => {
    setMobileOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FCF8F4]/95 backdrop-blur-md border-b border-[#EADCE2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => go('home')}
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#6B1D3A] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1D3A] rounded"
        >
          RAVI FANCY STORE
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => {
            const active =
              currentPage === link.id ||
              (link.id === 'shop' && currentPage === 'product');
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1D3A] rounded ${
                  active
                    ? 'text-[#6B1D3A]'
                    : 'text-[#5C3B47] hover:text-[#6B1D3A]'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active-underline"
                    className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#C94A70]"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action (My Cart) + mobile drawer trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-[#6B1D3A] text-white text-sm font-medium hover:bg-[#842449] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94A70]"
          >
            <motion.span
              key={cartCount}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.22, 1] }}
              transition={{ duration: 0.28 }}
              className="inline-flex"
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.span>
            <span>My Cart</span>
            <span className="font-mono text-xs tabular-nums bg-white/20 px-1.5 py-0.5 rounded">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg border border-[#EADCE2] text-[#2D1620] hover:bg-[#FDE8EF] transition-colors"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#EADCE2] bg-[#FCF8F4] px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentPage === link.id
                  ? 'bg-[#FDE8EF] text-[#6B1D3A]'
                  : 'text-[#2D1620] hover:bg-[#F3EDF8]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#EADCE2] flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => go('shop')}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-[#F3EDF8] text-[#2D1620]"
            >
              Wishlist ({wishlistCount})
            </button>
            <button
              type="button"
              onClick={() => go('tracking')}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-[#F3EDF8] text-[#2D1620]"
            >
              Track Order
            </button>
            <button
              type="button"
              onClick={() => go('admin')}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-[#F3EDF8] text-[#6B1D3A]"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
