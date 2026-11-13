import React, { useRef, useState } from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { CategoryItem, Product } from '../types/store';
import { HERO_BANNER_IMG, PROMO_BRIDAL_IMG } from '../utils/currency';
import { PageRoute } from './Navbar';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';

interface HomeViewProps {
  categories: CategoryItem[];
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onSelectCategory: (categoryName: string) => void;
  onNavigate: (page: PageRoute) => void;
}

const TESTIMONIALS = [
  {
    name: 'Lakshmi Subramanian',
    city: 'Mylapore, Chennai',
    purchase: 'Nizami Kundan Bridal Choker Set',
    quote:
      'I ordered the Nizami choker and jasmine hair pins four days before my sister’s muhurtham. The kundan foiling looked like real 22k heritage gold under mandap lights and arrived in a cushioned velvet box.',
  },
  {
    name: 'Priya Nair',
    city: 'Panampilly Nagar, Kochi',
    purchase: 'Kaveri Temple Gold Jumkas & Velvet Matte Lipsticks',
    quote:
      'These temple jumkas are hollow-crafted so they never hurt my earlobes during a full wedding reception. The Spiced Rose lipstick shade lasted cleanly through dinner without drying.',
  },
  {
    name: 'Kavitha Reddy',
    city: 'Banjara Hills, Hyderabad',
    purchase: 'Rani Pink Silk-Thread Bangle Set',
    quote:
      'Matching the exact wine-pink tone to my Kanjeevaram saree used to take hours in bazaars. Every bangle arrived spotless with zero loose threads and free delivery.',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  categories,
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewProduct,
  onSelectCategory,
  onNavigate,
}) => {
  const [showcaseTab, setShowcaseTab] = useState<'trending' | 'new'>('trending');
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  const displayedProducts = (
    showcaseTab === 'trending'
      ? products.filter((p) => p.isTrending)
      : products.filter((p) => p.isNewArrival)
  ).slice(0, 8);

  const countForCategory = (catName: string) =>
    products.filter((p) => p.category.toLowerCase() === catName.toLowerCase()).length;

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Full-Bleed Luminous Jewellery Hero with Subtle Parallax */}
      <section
        ref={heroRef}
        className="relative min-h-[540px] lg:min-h-[640px] w-full overflow-hidden flex items-center"
      >
        <motion.div
          style={{ y: heroParallaxY }}
          className="absolute inset-0 -top-10 -bottom-10 will-change-transform"
        >
          <ResilientImage
            src={HERO_BANNER_IMG}
            alt="RAVI FANCY STORE luxury bridal jewellery, jumkas, bangles and cosmetics showcase"
            fallbackLabel="RAVI FANCY STORE"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#2D1620]/85 via-[#2D1620]/50 to-transparent"
        />

        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-12 right-12 text-[#F3D799]/55 pointer-events-none animate-gentle-float"
        >
          <Sparkles className="w-9 h-9" strokeWidth={1.25} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl text-white"
          >
            <p className="text-sm font-medium tracking-wide text-[#F3D799] mb-4">
              Jewellery · Hair Ornaments · Luxury Cosmetics
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-balance text-white">
              Your Beauty, Your Style, Your Elegance.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#FAF4EE]/90 leading-relaxed max-w-lg">
              Handcrafted bridal necklaces, temple jumkas, silk-thread bangles, hair accessories, and velvet-finish cosmetics curated for timeless celebrations and effortless everyday grace.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="inline-flex items-center gap-2 py-3.5 px-7 rounded-lg bg-[#C69C53] text-[#2D1620] text-sm font-semibold hover:bg-[#D8B26E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('categories')}
                className="inline-flex items-center gap-2 py-3.5 px-7 rounded-lg border border-white/60 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Collections
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. All 12 Curated Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-medium text-[#C94A70] mb-1.5">
              Twelve Signature Collections
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620] tracking-tight">
              Shop by Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B1D3A] hover:text-[#C94A70] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.03, 0.25) }}
              onClick={() => onSelectCategory(cat.name)}
              className="group text-left bg-white rounded-xl border border-[#EADCE2] overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(107,29,58,0.2)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B1D3A]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#FAF4EE]">
                <ResilientImage
                  src={cat.image}
                  alt={cat.name}
                  fallbackLabel={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-[#2D1620] group-hover:text-[#6B1D3A] truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#654552] tabular-nums mt-0.5">
                    {countForCategory(cat.name)} designs
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C69C53] shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 3. Trending Products & New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-medium text-[#C94A70] mb-1.5">
              Curated Boutique Highlights
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620] tracking-tight">
              {showcaseTab === 'trending' ? 'Trending Treasures' : 'Fresh New Arrivals'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex p-1 rounded-lg bg-[#F3EDF8] border border-[#EADCE2]">
              <button
                type="button"
                onClick={() => setShowcaseTab('trending')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showcaseTab === 'trending'
                    ? 'bg-[#6B1D3A] text-white'
                    : 'text-[#5C3B47] hover:text-[#2D1620]'
                }`}
              >
                Trending Products
              </button>
              <button
                type="button"
                onClick={() => setShowcaseTab('new')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showcaseTab === 'new'
                    ? 'bg-[#6B1D3A] text-white'
                    : 'text-[#5C3B47] hover:text-[#2D1620]'
                }`}
              >
                New Arrivals
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B1D3A] hover:text-[#C94A70] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Shop All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product, idx) => (
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
      </section>

      {/* 4. Special Offers & Festive Bridal Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border border-[#EADCE2] grid grid-cols-1 lg:grid-cols-2 items-stretch bg-[#6B1D3A]">
          <div className="relative min-h-[280px] lg:min-h-[420px]">
            <ResilientImage
              src={PROMO_BRIDAL_IMG}
              alt="Bridal silk lehenga jewellery and festive pearl accessories"
              fallbackLabel="Bridal & Festive Collection"
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
          </div>

          <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center text-white">
            <p className="text-sm font-medium text-[#F3D799] mb-3">
              Festive & Wedding Privileges
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-balance">
              Complimentary Gift Boxing & Festive Savings
            </h2>
            <p className="mt-4 text-base text-[#FAF4EE]/85 leading-relaxed">
              Elevate your bridal trousseau or festive gifting. Enjoy free pan-India shipping above ₹799 plus exclusive privilege codes at checkout:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                <div className="font-mono text-base font-semibold text-[#F3D799] tabular-nums">
                  RAVI10
                </div>
                <p className="text-sm text-white/90 mt-1">
                  Extra 10% savings on orders above ₹999
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                <div className="font-mono text-base font-semibold text-[#F3D799] tabular-nums">
                  BRIDAL15
                </div>
                <p className="text-sm text-white/90 mt-1">
                  Extra 15% savings on bridal orders ₹2,499+
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => onSelectCategory('Necklaces')}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-[#FCF8F4] text-[#6B1D3A] text-sm font-semibold hover:bg-[#FDE8EF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Bridal Necklaces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-medium text-[#C94A70] mb-1.5">
            Cherished Across India
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620] tracking-tight">
            Words from Our Patrons
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, idx) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex flex-col justify-between p-7 rounded-xl bg-[#F3EDF8] border border-[#EADCE2]"
            >
              <div>
                <div className="flex items-center gap-1 text-[#C69C53] mb-4" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star key={starIdx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-[#2D1620] leading-relaxed">
                  “{item.quote}”
                </p>
              </div>

              <footer className="mt-6 pt-4 border-t border-[#DFD2E8]">
                <div className="font-display text-base font-semibold text-[#6B1D3A]">
                  {item.name}
                </div>
                <div className="text-xs text-[#654552] mt-0.5">
                  {item.city} · {item.purchase}
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>
    </div>
  );
};
