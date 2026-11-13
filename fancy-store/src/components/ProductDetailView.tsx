import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { Product } from '../types/store';
import { formatINR } from '../utils/currency';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  wishlistIds: string[];
  onBack: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  wishlistIds,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewProduct,
}) => {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setActiveImgIdx(0);
    setQuantity(1);
    setAddedFeedback(false);
  }, [product.id]);

  const gallery =
    product.images.length > 0
      ? product.images
      : ['/store-images/cat_necklaces_1794550860428.jpg'];
  const isWishlisted = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0;

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(
      allProducts.filter(
        (p) => p.id !== product.id && p.category !== product.category && p.isTrending
      )
    )
    .slice(0, 4);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B1D3A] hover:text-[#C94A70] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>
      </div>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white border border-[#EADCE2]">
            <ResilientImage
              src={gallery[activeImgIdx] || gallery[0]}
              alt={`${product.name} view ${activeImgIdx + 1}`}
              fallbackLabel={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImgIdx(idx)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImgIdx === idx
                      ? 'border-[#6B1D3A] ring-2 ring-[#C94A70]/30'
                      : 'border-[#EADCE2] opacity-80 hover:opacity-100'
                  }`}
                >
                  <ResilientImage
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Purchase Info */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#654552] mb-2">
              <span className="font-semibold text-[#6B1D3A]">
                {product.category}
                {product.offerLabel ? ` · ${product.offerLabel}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[#2D1620]">
                <Star className="w-3.5 h-3.5 fill-[#C69C53] text-[#C69C53]" />
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#2D1620] leading-snug">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-3 pb-5 border-b border-[#EADCE2]">
            <span className="font-mono text-3xl font-semibold text-[#6B1D3A] tabular-nums">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="font-mono text-base text-[#8D6F7B] line-through tabular-nums">
                  {formatINR(product.originalPrice)}
                </span>
                <span className="text-sm font-semibold text-[#C94A70] tabular-nums">
                  ({product.discountPercent}% Off)
                </span>
              </>
            )}
          </div>

          <p className="text-sm sm:text-base text-[#5C3B47] leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-3 text-sm bg-[#FCF8F4] p-4 rounded-xl border border-[#EADCE2]">
            <div>
              <span className="font-semibold text-[#2D1620]">Craft & Material: </span>
              <span className="text-[#5C3B47]">{product.material}</span>
            </div>
            <div>
              <span className="font-semibold text-[#2D1620]">Care Guide: </span>
              <span className="text-[#5C3B47]">{product.careInstructions}</span>
            </div>
            <div className="tabular-nums">
              <span className="font-semibold text-[#2D1620]">Availability: </span>
              <span
                className={
                  outOfStock ? 'text-[#B91C1C] font-medium' : 'text-[#6B1D3A] font-medium'
                }
              >
                {outOfStock
                  ? 'Currently Out of Stock'
                  : `In Stock (${product.stock} ready to dispatch)`}
              </span>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#2D1620]">Quantity</span>
              <div className="inline-flex items-center border border-[#EADCE2] rounded-lg bg-[#FCF8F4]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-2.5 text-[#2D1620] hover:text-[#6B1D3A] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-mono text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))
                  }
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="p-2.5 text-[#2D1620] hover:text-[#6B1D3A] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg border border-[#6B1D3A] text-[#6B1D3A] text-sm font-semibold hover:bg-[#FDE8EF] disabled:opacity-45 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {addedFeedback ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                <span>{addedFeedback ? 'Added to Cart' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => onBuyNow(product, quantity)}
                className="inline-flex items-center justify-center py-3 px-5 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] disabled:opacity-45 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Buy Now · {formatINR(product.price * quantity)}
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isWishlisted
                  ? 'border-[#C94A70] bg-[#FDE8EF] text-[#6B1D3A]'
                  : 'border-[#EADCE2] text-[#5C3B47] hover:bg-[#FAF4EE]'
              }`}
            >
              <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#EADCE2] grid grid-cols-2 gap-3 text-xs text-[#654552]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C69C53] shrink-0" />
              <span>Free delivery above ₹799</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C69C53] shrink-0" />
              <span>7-day boutique exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="pt-6 border-t border-[#EADCE2]">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#C94A70] mb-1">
            Complete the Look
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#2D1620]">
            Related Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((rel, idx) => (
            <ProductCard
              key={rel.id}
              product={rel}
              index={idx}
              isWishlisted={wishlistIds.includes(rel.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={(p) => onAddToCart(p, 1)}
              onBuyNow={(p) => onBuyNow(p, 1)}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
