import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CategoryItem, Product } from '../types/store';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface CategoriesViewProps {
  categories: CategoryItem[];
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSelectCategory,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#C94A70] mb-1.5">
          Curated Boutiques
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#2D1620] tracking-tight">
          Explore All 12 Collections
        </h1>
        <p className="mt-3 text-base text-[#654552] leading-relaxed">
          From temple-crafted jumkas and heirloom bridal chokers to velvet bindis, silk-thread bangles, and luxury beauty essentials.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {categories.map((cat, idx) => {
          const catProducts = products.filter(
            (p) => p.category.toLowerCase() === cat.name.toLowerCase()
          );
          const minPrice =
            catProducts.length > 0
              ? Math.min(...catProducts.map((p) => p.price))
              : 199;

          return (
            <motion.article
              key={cat.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.25) }}
              className="group bg-white rounded-xl border border-[#EADCE2] overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_rgba(107,29,58,0.18)] transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className="aspect-[4/3] w-full overflow-hidden bg-[#FAF4EE] text-left cursor-pointer"
              >
                <ResilientImage
                  src={cat.image}
                  alt={cat.name}
                  fallbackLabel={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between text-xs text-[#654552] mb-1.5 tabular-nums">
                  <span>{catProducts.length} styles available</span>
                  <span>Starting {formatINR(minPrice)}</span>
                </div>

                <h2 className="font-display text-2xl font-semibold text-[#2D1620]">
                  {cat.name}
                </h2>
                <p className="mt-2 text-sm text-[#654552] leading-relaxed flex-1">
                  {cat.description}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className="mt-5 inline-flex items-center justify-between w-full py-2.5 px-4 rounded-lg bg-[#FDE8EF] text-[#6B1D3A] text-sm font-semibold hover:bg-[#6B1D3A] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Browse {cat.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};
