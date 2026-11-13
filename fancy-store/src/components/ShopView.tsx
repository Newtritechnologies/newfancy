import React, { useMemo, useState } from 'react';
import { Heart, PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryItem, Product } from '../types/store';
import { PageRoute } from './Navbar';
import { ProductCard } from './ProductCard';

interface ShopViewProps {
  categories: CategoryItem[];
  products: Product[];
  selectedCategory: string;
  wishlistIds: string[];
  onSelectCategory: (cat: string) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onNavigate: (page: PageRoute) => void;
}

type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'discount';

export const ShopView: React.FC<ShopViewProps> = ({
  categories,
  products,
  selectedCategory,
  wishlistIds,
  onSelectCategory,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewProduct,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [wishlistOnly, setWishlistOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (wishlistOnly && !wishlistIds.includes(p.id)) {
        return false;
      }
      if (q) {
        const hay = `${p.name} ${p.category} ${p.description} ${p.material}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list];
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'discount') list.sort((a, b) => b.discountPercent - a.discountPercent);
    else list.sort((a, b) => b.popularity - a.popularity);

    return list;
  }, [products, selectedCategory, wishlistOnly, wishlistIds, searchQuery, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    onSelectCategory('All');
    setWishlistOnly(false);
    setSortBy('popularity');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header & Quick Utilities */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EADCE2] pb-6">
        <div>
          <p className="text-sm font-medium text-[#C94A70] mb-1">
            RAVI FANCY STORE Catalog
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620] tracking-tight">
            {wishlistOnly
              ? 'My Saved Wishlist'
              : selectedCategory === 'All'
                ? 'All Jewellery, Accessories & Beauty'
                : selectedCategory}
          </h1>
          <p className="text-sm text-[#654552] mt-1 tabular-nums">
            Showing {filteredProducts.length} curated item{filteredProducts.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setWishlistOnly((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              wishlistOnly
                ? 'bg-[#6B1D3A] text-white border-[#6B1D3A]'
                : 'bg-white text-[#2D1620] border-[#EADCE2] hover:bg-[#FDE8EF]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" fill={wishlistOnly ? 'currentColor' : 'none'} />
            <span>Wishlist ({wishlistIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('tracking')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F3EDF8] border border-[#EADCE2] text-[#2D1620] text-xs font-semibold hover:bg-[#FDE8EF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PackageSearch className="w-3.5 h-3.5 text-[#6B1D3A]" />
            <span>Track Order</span>
          </button>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-[#654552] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jumkas, kundan chokers, hair clips, bindis, matte lipsticks..."
            className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-white border border-[#EADCE2] text-sm text-[#2D1620] placeholder:text-[#8D6F7B] focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#654552] hover:text-[#2D1620]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label htmlFor="sort-select" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#654552] whitespace-nowrap">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3.5 py-2.5 rounded-lg bg-white border border-[#EADCE2] text-sm font-medium text-[#2D1620] focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
          >
            <option value="popularity">Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => onSelectCategory('All')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#6B1D3A] text-white'
              : 'bg-white border border-[#EADCE2] text-[#5C3B47] hover:text-[#6B1D3A] hover:bg-[#FDE8EF]'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.name)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === cat.name
                ? 'bg-[#6B1D3A] text-white'
                : 'bg-white border border-[#EADCE2] text-[#5C3B47] hover:text-[#6B1D3A] hover:bg-[#FDE8EF]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-[#EADCE2]">
          <h2 className="font-display text-2xl font-semibold text-[#2D1620]">
            No matching items found
          </h2>
          <p className="text-sm text-[#654552] mt-2 max-w-md mx-auto">
            Try clearing your search query or switching to All Categories to explore our full boutique selection.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 px-6 py-2.5 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
