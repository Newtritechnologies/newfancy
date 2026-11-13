import React, { useMemo, useState } from 'react';
import { ArrowRight, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { SUPERMARKET_BACKGROUNDS, type DepartmentName } from '../types/supermarket';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';

export function CategoriesView() {
  const { categories, navigateToCategory, products } = useStore();

  return (
    <div className="pb-20 space-y-12">
      {/* Attractive Full-Bleed Category Page Banner */}
      <section className="relative h-64 sm:h-72 flex items-end overflow-hidden bg-[#0A1612]">
        <img
          src={SUPERMARKET_BACKGROUNDS.heroAisle}
          alt="RAVI SUPERMARKET 12 Departments"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07150F] via-[#07150F]/65 to-[#07150F]/30" />
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 pb-8 text-white">
          <p className="text-xs font-heading font-semibold tracking-wider text-[#FDE68A]">
            ALL 12 CURATED AISLES
          </p>
          <h1 className="mt-1 font-display font-bold text-3xl sm:text-5xl">
            Store Departments
          </h1>
          <p className="mt-2 text-sm text-emerald-100/85 max-w-xl">
            Browse every department with dedicated aisle photography and unique 1-to-1 curated
            products.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {categories.map((cat, idx) => {
          const deptProducts = products.filter((p) => p.category === cat.name);
          return (
            <motion.article
              key={cat.id}
              initial={{ opacity: 0, y: 26, rotateX: -8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.42, delay: (idx % 3) * 0.06 }}
              whileHover={{ y: -6 }}
              onClick={() => navigateToCategory(cat.name)}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200/85 dark:border-emerald-900/50 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ResilientImage
                  src={cat.image}
                  alt={cat.name}
                  className="group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-[11px] font-heading font-semibold text-[#FDE68A]">
                    {cat.accentLabel}
                  </p>
                  <h2 className="font-display font-bold text-xl">{cat.name}</h2>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-emerald-950/60">
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-emerald-200/70 tabular-nums">
                    {deptProducts.length} unique products
                  </span>
                  <span className="text-xs font-heading font-semibold text-[#047857] dark:text-[#34D399] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore Aisle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

export function ProductsCatalogView() {
  const { products, categories, selectedCategory, setRoute, searchQuery, setSearchQuery } = useStore();
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(2500);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (p.price > maxPrice) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.brand.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !p.subcategory.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'discount') list = [...list].sort((a, b) => b.discountPercent - a.discountPercent);
    else list = [...list].sort((a, b) => b.popularity - a.popularity);

    return list;
  }, [products, selectedCategory, searchQuery, sortBy, maxPrice]);

  return (
    <div className="pb-20 space-y-10">
      {/* Attractive Backdrop Banner for Products Page */}
      <section className="relative h-60 sm:h-68 flex items-end overflow-hidden bg-[#0A1612]">
        <img
          src={SUPERMARKET_BACKGROUNDS.harvestPromo}
          alt="RAVI SUPERMARKET Unique Products Catalog"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07150F] via-[#07150F]/65 to-[#07150F]/25" />
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 pb-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-heading font-semibold tracking-wider text-[#FDE68A] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-TO-1 UNIQUE PRODUCT PHOTOGRAPHY</span>
            </p>
            <h1 className="mt-1 font-display font-bold text-3xl sm:text-5xl">
              {selectedCategory === 'All' ? 'All Supermarket Products' : selectedCategory}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-mono tabular-nums text-emerald-100/90">
            Showing {filtered.length} of {products.length} unique products
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Category Filter Chips & Sort Controls */}
        <div className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200/80 dark:border-emerald-900/50 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRoute('products', { category: 'All' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-[#047857] text-white'
                  : 'bg-slate-100 dark:bg-[#162C22] text-slate-700 dark:text-emerald-100 hover:bg-slate-200 dark:hover:bg-emerald-900/60'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setRoute('products', { category: cat.name as DepartmentName })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-[#047857] text-white'
                    : 'bg-slate-100 dark:bg-[#162C22] text-slate-700 dark:text-emerald-100 hover:bg-slate-200 dark:hover:bg-emerald-900/60'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-emerald-100/80">
              <Filter className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
              <label htmlFor="price-cap" className="font-medium whitespace-nowrap">
                Max Price: <span className="font-mono font-semibold">₹{maxPrice}</span>
              </label>
              <input
                id="price-cap"
                type="range"
                min={100}
                max={2500}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-32 sm:w-44 accent-[#047857] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <SlidersHorizontal className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'discount'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#162C22] text-slate-800 dark:text-emerald-50 font-heading font-medium focus:outline-none cursor-pointer"
              >
                <option value="popular">Sort: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="discount">Biggest Savings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/50 p-12 text-center space-y-3">
            <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              No matching products found
            </p>
            <p className="text-sm text-slate-600 dark:text-emerald-100/70">
              Try clearing your search query or adjusting the department & price filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMaxPrice(2500);
                setRoute('products', { category: 'All' });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#047857] text-white text-xs font-heading font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filtered.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
