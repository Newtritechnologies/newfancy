import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  GitCompareArrows,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatINR, formatShortDate } from '../utils/currency';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';
import { RollingCounter } from './RollingTransition';

type InspectionAngle = 'studio' | 'macro' | 'packaging';

export function ProductDetailView() {
  const {
    products,
    selectedProductId,
    setRoute,
    addToCart,
    toggleWishlist,
    wishlist,
    toggleCompare,
    compareIds,
    setCartOpen,
    updateProductInState,
    user,
    pushToast,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  const [qty, setQty] = useState(1);
  const [angle, setAngle] = useState<InspectionAngle>('studio');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const related = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const others = products.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    return [...sameCat, ...others].slice(0, 3);
  }, [products, product]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  const handleAdd = () => {
    addToCart(product.id, qty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  const handleBuyNow = () => {
    addToCart(product.id, qty);
    setRoute('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      try {
        const res = await fetch(`/api/products/${product.id}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user?.name || 'Verified Anna Nagar Shopper',
            rating: reviewRating,
            title: reviewTitle || 'Fresh RAVI Quality',
            comment: reviewComment,
          }),
        });
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          if (data.product) {
            updateProductInState(data.product);
            setReviewTitle('');
            setReviewComment('');
            pushToast('Review Posted', 'Thank you for sharing your feedback.');
            return;
          }
        }
      } catch {
        // Static Netlify fallback below
      }
      const nextReview = {
        id: `rev-${Date.now()}`,
        userName: user?.name || 'Verified Anna Nagar Shopper',
        rating: reviewRating,
        title: reviewTitle || 'Fresh RAVI Quality',
        comment: reviewComment,
        verifiedPurchase: true,
        createdAt: new Date().toISOString(),
      };
      updateProductInState({
        ...product,
        reviews: [nextReview, ...product.reviews],
        reviewCount: product.reviewCount + 1,
      });
      setReviewTitle('');
      setReviewComment('');
      pushToast('Review Posted', 'Thank you for sharing your feedback.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // GPU transform inspection views using ONLY the exact matched studio photo
  const imageTransformStyle =
    angle === 'macro'
      ? { scale: 1.45, x: '0%', y: '-4%' }
      : angle === 'packaging'
      ? { scale: 1.25, x: '-6%', y: '5%' }
      : { scale: 1, x: '0%', y: '0%' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      <div className="flex items-center justify-between gap-4">
        <motion.button
          type="button"
          whileHover={{ x: -3 }}
          onClick={() => setRoute('products', { category: product.category })}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-slate-600 dark:text-emerald-200 hover:text-[#047857] dark:hover:text-[#34D399] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {product.category}</span>
        </motion.button>

        <span className="font-mono text-xs text-slate-400 dark:text-emerald-200/50">
          SKU · {product.sku}
        </span>
      </div>

      {/* Main Contiguous Studio Product Gallery + Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Rolling Perspective Image Viewer (strictly 1-to-1 product photo) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#F1F5F0] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900/60 shadow-lg">
            <motion.div
              animate={imageTransformStyle}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="w-full h-full"
            >
              <ResilientImage src={product.image} alt={product.name} loading="eager" />
            </motion.div>

            {product.offerLabel && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#064E3B]/90 text-[#FDE68A] text-xs font-heading font-semibold backdrop-blur-sm">
                {product.offerLabel}
              </span>
            )}
          </div>

          {/* Interactive Angle Presets of the EXACT same product photo */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'studio' as InspectionAngle, label: 'Full Studio View' },
              { id: 'macro' as InspectionAngle, label: 'Close Texture Zoom' },
              { id: 'packaging' as InspectionAngle, label: 'Pack Detail' },
            ].map((view) => (
              <motion.button
                key={view.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setAngle(view.id)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  angle === view.id
                    ? 'border-[#047857] bg-[#ECFDF5] dark:bg-emerald-950/70 dark:border-[#34D399]'
                    : 'border-slate-200 dark:border-emerald-900/50 bg-white dark:bg-[#111F18] hover:border-[#047857]/50'
                }`}
              >
                <img
                  src={product.image}
                  alt={view.label}
                  className={`w-10 h-10 rounded-lg object-cover shrink-0 ${
                    view.id === 'macro'
                      ? 'scale-125'
                      : view.id === 'packaging'
                      ? 'object-bottom'
                      : ''
                  }`}
                />
                <span className="text-[11px] font-heading font-semibold text-slate-800 dark:text-emerald-100 leading-tight">
                  {view.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-6 space-y-6 rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200/85 dark:border-emerald-900/50 p-6 sm:p-8 shadow-sm"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-emerald-200/70 font-medium">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.subcategory}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono">
                <Star className="w-3.5 h-3.5 fill-current" />
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <p className="text-sm text-slate-500 dark:text-emerald-200/70">
              {product.brand} · Pack Size: <strong className="text-slate-700 dark:text-emerald-100">{product.weight}</strong>
            </p>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-2xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200/70 dark:border-emerald-900/60 flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3 tabular-nums">
              <span className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-slate-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-heading font-semibold text-[#047857] dark:text-[#34D399]">
                  {product.discountPercent}% Instant Savings
                </span>
              )}
            </div>

            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300 font-medium tabular-nums">
              {product.stock > 0 ? `In Stock · ${product.stock} units` : 'Restocking'}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-emerald-100/80 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Stepper & Primary Purchase Controls */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-emerald-900 bg-[#F8FAF7] dark:bg-[#0D1A14]">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-700 dark:text-emerald-100 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="w-10 text-center font-mono font-bold text-sm text-slate-900 dark:text-white">
                  <RollingCounter value={qty} />
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-700 dark:text-emerald-100 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAdd}
                className="flex-1 min-w-[160px] py-3 px-5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-[#FDE68A]" />
                    <span>Added to Basket</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Basket</span>
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleBuyNow}
                className="py-3 px-5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-heading font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleWishlist(product.id)}
                className={`px-4 py-2 rounded-xl border text-xs font-heading font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isWishlisted
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300'
                    : 'border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-emerald-100 hover:border-[#047857]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCompare(product.id)}
                className={`px-4 py-2 rounded-xl border text-xs font-heading font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isCompared
                    ? 'border-[#D97706] bg-amber-50 dark:bg-amber-950/50 text-[#D97706] dark:text-amber-300'
                    : 'border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-emerald-100 hover:border-[#047857]'
                }`}
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
              </motion.button>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="text-xs font-heading font-semibold text-[#047857] dark:text-[#34D399] hover:underline ml-auto cursor-pointer"
              >
                Open Basket Drawer
              </button>
            </div>
          </div>

          {/* Delivery & Batch Assurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-emerald-100/75">
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200/70 dark:border-emerald-900/50 flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
              <span>Free cold-chain delivery ≥ ₹499</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200/70 dark:border-emerald-900/50 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
              <span>100% Genuine & GST Invoice Ready</span>
            </div>
          </div>

          {/* Structured Specifications Table */}
          <div className="pt-2 space-y-3">
            <h2 className="font-heading font-semibold text-sm text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
              <span>Product Specifications</span>
            </h2>
            <dl className="divide-y divide-slate-100 dark:divide-emerald-950/60 border border-slate-200/75 dark:border-emerald-900/50 rounded-2xl overflow-hidden text-xs sm:text-sm">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div
                  key={key}
                  className="px-4 py-2.5 flex items-center justify-between gap-4 bg-white dark:bg-[#111F18]"
                >
                  <dt className="text-slate-500 dark:text-emerald-200/70">{key}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white text-right tabular-nums">
                    {val}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </div>

      {/* Customer Reviews & Review Composer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Verified Customer Reviews
          </h2>
          <div className="space-y-4">
            {product.reviews.map((rev) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-5 rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200/80 dark:border-emerald-900/50 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                    {rev.userName} · Verified Shopper
                  </p>
                  <span className="font-mono text-xs text-amber-500">
                    {'★'.repeat(rev.rating)}
                  </span>
                </div>
                <p className="font-semibold text-sm text-[#047857] dark:text-[#34D399]">
                  {rev.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                  {rev.comment}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatShortDate(rev.createdAt)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <form
            onSubmit={handleReviewSubmit}
            className="p-6 rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200/80 dark:border-emerald-900/50 space-y-4"
          >
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Write a Product Review
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-emerald-100/75">
              <span>Rating:</span>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setReviewRating(num)}
                  className={`px-2 py-1 rounded-md font-mono cursor-pointer ${
                    reviewRating >= num
                      ? 'bg-amber-400 text-slate-900 font-bold'
                      : 'bg-slate-100 dark:bg-[#162C22] text-slate-500'
                  }`}
                >
                  {num}★
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Headline (e.g. Super fresh harvest)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm focus:outline-none focus:border-[#047857]"
            />
            <textarea
              rows={3}
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share quality, aroma, freshness, or delivery impressions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm focus:outline-none focus:border-[#047857]"
            />
            <motion.button
              type="submit"
              disabled={submittingReview}
              whileTap={{ scale: 0.96 }}
              className="w-full py-2.5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-xs sm:text-sm cursor-pointer disabled:opacity-60"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </motion.button>
          </form>
        </div>
      </section>

      {/* Related Unique Products */}
      <section className="space-y-6 pt-4">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Pair with Other Unique Picks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((item, idx) => (
            <ProductCard key={item.id} product={item} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}
