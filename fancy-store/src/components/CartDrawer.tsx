import React from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Product } from '../types/store';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

export interface CartEntry {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartEntry[];
  onClose: () => void;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onShopNow: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onShopNow,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 799;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Cart">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2D1620]/50 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#FCF8F4] h-full flex flex-col border-l border-[#EADCE2] shadow-2xl"
          >
            <div className="px-6 py-5 border-b border-[#EADCE2] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#6B1D3A]" />
                <h2 className="font-display text-xl font-semibold text-[#2D1620]">
                  My Shopping Cart
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="p-2 rounded-lg text-[#5C3B47] hover:bg-[#FDE8EF] hover:text-[#6B1D3A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length > 0 && (
              <div className="px-6 py-3 bg-[#F3EDF8] border-b border-[#EADCE2] text-xs font-medium text-[#2D1620] tabular-nums">
                {remainingForFreeShipping === 0
                  ? 'Complimentary Pan-India Express Shipping unlocked on this order.'
                  : `Add ${formatINR(remainingForFreeShipping)} more to unlock free Pan-India delivery.`}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#FDE8EF] flex items-center justify-center text-[#6B1D3A] mb-4">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#2D1620]">
                    Your cart is waiting
                  </h3>
                  <p className="text-sm text-[#654552] mt-2 max-w-xs">
                    Explore our temple jumkas, silk-thread bangles, hair pins, and beauty essentials to add your favourites.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onShopNow();
                    }}
                    className="mt-6 px-6 py-2.5 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors cursor-pointer"
                  >
                    Explore Boutique
                  </button>
                </div>
              ) : (
                items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-3.5 rounded-xl bg-white border border-[#EADCE2]"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#FAF4EE] shrink-0">
                      <ResilientImage
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-sm font-semibold text-[#2D1620] line-clamp-2">
                            {product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(product.id)}
                            aria-label={`Remove ${product.name}`}
                            className="text-[#8D6F7B] hover:text-[#B91C1C] transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#654552] mt-0.5">{product.category}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-3">
                        <div className="inline-flex items-center border border-[#EADCE2] rounded-md bg-[#FCF8F4]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-1.5 text-[#2D1620] hover:text-[#6B1D3A] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 font-mono text-xs font-semibold tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(product.id, Math.min(product.stock, quantity + 1))
                            }
                            disabled={quantity >= product.stock}
                            aria-label="Increase quantity"
                            className="p-1.5 text-[#2D1620] hover:text-[#6B1D3A] disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono text-sm font-semibold text-[#6B1D3A] tabular-nums">
                          {formatINR(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-[#EADCE2] space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between text-[#654552]">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-[#2D1620] tabular-nums">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#654552]">
                    <span>Shipping</span>
                    <span className="font-mono tabular-nums">
                      {subtotal >= freeShippingThreshold ? 'Free' : formatINR(60)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
