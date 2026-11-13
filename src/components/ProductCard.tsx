import React, { useState } from 'react';
import { Check, GitCompareArrows, Heart, Plus, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import type { SupermarketProduct } from '../types/supermarket';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: SupermarketProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const {
    navigateToProduct,
    addToCart,
    toggleWishlist,
    wishlist,
    toggleCompare,
    compareIds,
  } = useStore();
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1100);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, rotateX: -8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.42,
        delay: Math.min((index % 6) * 0.05, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      onClick={() => navigateToProduct(product.id)}
      className="group cursor-pointer rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200/85 dark:border-emerald-900/50 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-emerald-950/8 dark:hover:shadow-black/40 transition-shadow duration-300 flex flex-col"
    >
      {/* Image stage (68% visual lead, clean neutral surface, exact 1-to-1 photo) */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F1F5F0] dark:bg-[#0D1A14]">
        <ResilientImage
          src={product.image}
          alt={product.name}
          className="group-hover:scale-106 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />

        {/* Subtle sheen sweep across image on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />

        {/* Subtle single text offer tag + functional action icons */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {product.offerLabel ? (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-heading font-semibold bg-[#064E3B]/90 text-[#FDE68A] backdrop-blur-sm">
              {product.offerLabel}
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              aria-label={isCompared ? 'Remove from comparison' : 'Compare product'}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleCompare(product.id);
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors ${
                isCompared
                  ? 'bg-[#D97706] text-white'
                  : 'bg-white/90 dark:bg-[#0A1612]/85 text-slate-700 dark:text-emerald-100 hover:bg-white dark:hover:bg-[#13291F]'
              }`}
            >
              <GitCompareArrows className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              whileTap={{ scale: 1.3 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors ${
                isWishlisted
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/90 dark:bg-[#0A1612]/85 text-slate-700 dark:text-emerald-100 hover:bg-white dark:hover:bg-[#13291F]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Product info & aligned pricing */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-emerald-200/70">
            <span className="truncate font-medium tracking-wide">
              {product.category}
            </span>
            <span className="shrink-0 inline-flex items-center gap-1 font-mono tabular-nums text-amber-600 dark:text-amber-400 font-medium">
              <Star className="w-3.5 h-3.5 fill-current" />
              {product.rating.toFixed(1)}
            </span>
          </div>

          <h3 className="mt-1.5 font-heading font-semibold text-[15px] sm:text-base leading-snug text-slate-900 dark:text-white group-hover:text-[#047857] dark:group-hover:text-[#34D399] transition-colors line-clamp-2">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-emerald-100/60 truncate">
            {product.brand} · {product.weight}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            className={`px-3.5 py-2 rounded-lg text-xs font-heading font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              justAdded
                ? 'bg-[#065F46] text-[#FDE68A]'
                : 'bg-[#047857] hover:bg-[#065F46] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
                <Plus className="w-3 h-3" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
