import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Sparkles, Tag, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { SUPERMARKET_BACKGROUNDS } from '../types/supermarket';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';
import { RevealBlock } from './RollingTransition';

const METRICS_STRIP = [
  { value: '24', label: 'Unique Studio-Curated Essentials' },
  { value: '45 Min', label: 'Express Neighborhood Dispatch' },
  { value: '12', label: 'Dedicated Store Departments' },
  { value: '100%', label: 'Matched Product Photography' },
];

export function HomeView() {
  const { products, categories, setRoute, navigateToCategory, coupons } = useStore();
  const [heroTab, setHeroTab] = useState<'deals' | 'bestsellers' | 'new'>('deals');

  const showcasedProducts = useMemo(() => {
    if (heroTab === 'bestsellers') {
      return products.filter((p) => p.isBestSeller).slice(0, 6);
    }
    if (heroTab === 'new') {
      return products.filter((p) => p.isNewArrival || p.isTrending).slice(0, 6);
    }
    return products.slice(0, 6);
  }, [products, heroTab]);

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. Attractive Full-Width Hero Canvas with Animated Background */}
      <section className="relative min-h-[520px] lg:min-h-[580px] flex items-center overflow-hidden bg-[#0A1612]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={SUPERMARKET_BACKGROUNDS.heroMain}
            alt="RAVI SUPERMARKET Sunlit Organic Produce Hall"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07150F]/90 via-[#07150F]/65 to-[#07150F]/25" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 text-white"
          >
            <p className="text-xs sm:text-sm font-heading font-semibold tracking-wider text-[#FDE68A]">
              ANNA NAGAR FLAGSHIP · EXPRESS 45-MIN DISPATCH
            </p>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.06] text-balance">
              Fresh harvest tables, stocked with exact honesty.
            </h1>

            <p className="text-base sm:text-lg text-emerald-50/90 max-w-xl leading-relaxed">
              Every product inside RAVI SUPERMARKET is uniquely photographed and batch-verified—from
              Ratnagiri Alphonso mangoes and aged Basmati to copper-base cookware and farm A2 milk.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setRoute('products', { category: 'All' })}
                className="px-6 py-3.5 rounded-xl bg-[#047857] hover:bg-[#059669] text-white font-heading font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <span>Shop All 24 Unique Picks</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setRoute('offers')}
                className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-heading font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-[#FDE68A]" />
                <span>View {coupons.length} Store Offers</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Animated Highlight Card right */}
          <motion.div
            initial={{ opacity: 0, x: 36, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/25 p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-[#FDE68A] font-heading font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  MORNING AISLE SPOTLIGHT
                </span>
                <span className="font-mono">FRESH10</span>
              </div>
              <div className="aspect-[16/9] rounded-xl overflow-hidden">
                <ResilientImage
                  src={SUPERMARKET_BACKGROUNDS.heroAisle}
                  alt="RAVI SUPERMARKET Fresh Aisle"
                  loading="eager"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-heading font-semibold text-sm">
                    Flat 10% Off Baskets Above ₹799
                  </p>
                  <p className="text-xs text-emerald-100/80">
                    Free cold-chain delivery on orders ≥ ₹499
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRoute('offers')}
                  className="px-3.5 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-heading font-semibold shrink-0 cursor-pointer"
                >
                  Apply Code
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quantitative Proof Strip directly below Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS_STRIP.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200/80 dark:border-emerald-900/50 p-5 shadow-md shadow-slate-900/5"
            >
              <p className="font-display font-bold text-2xl sm:text-3xl text-[#047857] dark:text-[#34D399] tabular-nums">
                {metric.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-emerald-100/75 font-medium">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. Curated Unique Products Showcase (Single Focal Grid with interactive tab filter) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-heading font-semibold tracking-wider text-[#047857] dark:text-[#34D399]">
              CURATED CATALOG · ZERO REPEATS
            </p>
            <h2 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
              Signature Supermarket Picks
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-[#13251D] self-start sm:self-auto">
            {[
              { key: 'deals', label: 'Featured' },
              { key: 'bestsellers', label: 'Best Sellers' },
              { key: 'new', label: 'Trending & New' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setHeroTab(tab.key as 'deals' | 'bestsellers' | 'new')}
                className={`px-3.5 py-2 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  heroTab === tab.key
                    ? 'bg-white dark:bg-[#047857] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-emerald-100/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {showcasedProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setRoute('products', { category: 'All' })}
            className="px-6 py-3 rounded-xl border border-[#047857] text-[#047857] dark:border-[#34D399] dark:text-[#34D399] hover:bg-[#047857] hover:text-white dark:hover:bg-[#047857] dark:hover:text-white font-heading font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Browse All 24 Unique Products</span>
            <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </div>
      </section>

      {/* 3. Interactive Shop-by-Department Strip (12 Departments) */}
      <RevealBlock className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-heading font-semibold tracking-wider text-[#047857] dark:text-[#34D399]">
              EXPLORE 12 AISLES
            </p>
            <h2 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
              Shop by Department
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setRoute('categories')}
            className="text-sm font-heading font-semibold text-[#047857] dark:text-[#34D399] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>All 12 Departments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat, idx) => (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigateToCategory(cat.name)}
              className="group text-left rounded-2xl overflow-hidden bg-white dark:bg-[#111F18] border border-slate-200/80 dark:border-emerald-900/50 shadow-xs hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <ResilientImage
                  src={cat.image}
                  alt={cat.name}
                  className="group-hover:scale-108 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <p className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                  {cat.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-emerald-200/60 mt-0.5 tabular-nums">
                  {cat.productCount} unique picks
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </RevealBlock>

      {/* 4. Attractive Harvest & Cold-Chain Story Split (Balanced items-stretch) */}
      <RevealBlock className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl overflow-hidden bg-[#0A1612] text-white grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-xl">
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-heading font-semibold tracking-wider text-[#FDE68A]">
                HARVEST PROMISE · DIRECT FARM DISPATCH
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl leading-tight">
                Packed fresh before dawn, rolled to your doorstep in 45 minutes.
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed">
                Every grain bag, cold-pressed oil bottle, and organic orchard crate inside our
                store is cataloged individually—no recycled photos, no surprise substitutions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setRoute('about')}
                className="px-5 py-3 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-heading font-semibold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Read Our Harvest Story</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                type="button"
                onClick={() => setRoute('contact')}
                className="px-5 py-3 rounded-xl border border-white/25 hover:bg-white/10 text-white font-heading font-semibold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-[#FDE68A]" />
                <span>Contact Store Concierge</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative min-h-[280px] overflow-hidden">
            <img
              src={SUPERMARKET_BACKGROUNDS.harvestPromo}
              alt="Curated pantry harvest basket at RAVI SUPERMARKET"
              referrerPolicy="no-referrer"
              className="w-full h-full lg:h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </RevealBlock>
    </div>
  );
}
