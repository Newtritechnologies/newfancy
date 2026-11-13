import React from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types/store';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewProduct,
  index = 0,
}) => {
  const outOfStock = product.stock <= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-white rounded-xl border border-[#EADCE2] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_rgba(107,29,58,0.18)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF4EE]">
        <button
          type="button"
          onClick={() => onViewProduct(product)}
          className="block w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1D3A]"
          aria-label={`View details for ${product.name}`}
        >
          <ResilientImage
            src={product.images[0]}
            alt={product.name}
            fallbackLabel={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </button>

        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1D3A] ${
            isWishlisted
              ? 'bg-[#6B1D3A] text-white'
              : 'bg-white/90 text-[#2D1620] hover:bg-white hover:text-[#C94A70]'
          }`}
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-[#654552] mb-1.5">
          <span className="truncate font-medium text-[#6B1D3A]">
            {product.category}
            {product.offerLabel ? ` · ${product.offerLabel}` : ''}
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums shrink-0 text-[#2D1620]">
            <Star className="w-3.5 h-3.5 text-[#C69C53] fill-[#C69C53]" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewProduct(product)}
          className="text-left focus-visible:outline-none"
        >
          <h3 className="font-display text-lg font-semibold text-[#2D1620] leading-snug line-clamp-2 group-hover:text-[#6B1D3A] transition-colors">
            {product.name}
          </h3>
        </button>

        <p className="mt-1.5 text-sm text-[#654552] line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between gap-2 mb-3.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-semibold text-[#2D1620] tabular-nums">
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="font-mono text-xs text-[#8D6F7B] line-through tabular-nums">
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-medium text-[#C94A70] tabular-nums">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>
            <span className="text-xs text-[#654552] tabular-nums shrink-0">
              {outOfStock ? 'Sold Out' : `${product.stock} left`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => onAddToCart(product)}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#6B1D3A] text-[#6B1D3A] text-xs font-semibold hover:bg-[#FDE8EF] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => onBuyNow(product)}
              className="inline-flex items-center justify-center py-2.5 px-3 rounded-lg bg-[#6B1D3A] text-white text-xs font-semibold hover:bg-[#842449] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
