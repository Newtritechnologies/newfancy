import React, { useState } from 'react';
import {
  ArrowRight,
  GitCompareArrows,
  Minus,
  Plus,
  Printer,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import type { SupermarketOrder } from '../types/supermarket';
import { formatDateTime, formatINR } from '../utils/currency';
import { RollingCounter } from './RollingTransition';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartSubtotal,
    updateCartQty,
    removeFromCart,
    setRoute,
  } = useStore();

  const freeDeliveryThreshold = 499;
  const remaining = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const progress = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-white dark:bg-[#0D1A14] border-l border-slate-200 dark:border-emerald-900 shadow-2xl flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#047857] dark:text-[#34D399]" />
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Your Basket
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close basket drawer"
                onClick={() => setCartOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-950 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Progress */}
            <div className="px-6 py-3 bg-[#F1F5F0] dark:bg-[#11241B] border-b border-slate-200/70 dark:border-emerald-950 space-y-1.5">
              <p className="text-xs font-medium text-slate-700 dark:text-emerald-100">
                {remaining === 0
                  ? 'Free 45-minute express delivery unlocked!'
                  : `Add ₹${remaining} more for FREE express delivery`}
              </p>
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-emerald-950 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-[#047857] dark:bg-[#34D399] rounded-full"
                />
              </div>
            </div>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-emerald-800 mx-auto" />
                  <p className="font-heading font-semibold text-slate-800 dark:text-white">
                    Your basket is empty
                  </p>
                  <p className="text-xs text-slate-500 dark:text-emerald-200/60">
                    Explore unique orchard produce and pantry essentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      setRoute('products', { category: 'All' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#047857] text-white text-xs font-heading font-semibold cursor-pointer"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((entry) => {
                    const p = entry.product!;
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="p-3 rounded-2xl bg-[#F8FAF7] dark:bg-[#13251D] border border-slate-200/70 dark:border-emerald-900/50 flex items-center gap-3"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-emerald-200/60">
                            {p.weight} · {formatINR(p.price)} each
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#0D1A14]">
                              <button
                                type="button"
                                onClick={() => updateCartQty(p.id, entry.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-emerald-100 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-bold">
                                <RollingCounter value={entry.quantity} />
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(p.id, entry.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-emerald-100 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              aria-label="Remove item"
                              onClick={() => removeFromCart(p.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#0D1A14] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-emerald-100/75">Basket Subtotal</span>
                  <span className="font-display font-bold text-2xl text-slate-900 dark:text-white tabular-nums">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setCartOpen(false);
                    setRoute('checkout');
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function CompareModal() {
  const { compareOpen, setCompareOpen, compareIds, products, toggleCompare, addToCart } =
    useStore();

  const items = products.filter((p) => compareIds.includes(p.id));

  return (
    <AnimatePresence>
      {compareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.94, rotateX: 10 }}
            className="w-full max-w-4xl rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="w-5 h-5 text-[#D97706]" />
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Compare Products ({items.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCompareOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-950 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-auto grid grid-cols-1 md:grid-cols-3 gap-5">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 dark:border-emerald-900 p-4 space-y-3 bg-[#F8FAF7] dark:bg-[#0D1A14]"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full aspect-[4/3] object-cover rounded-xl"
                  />
                  <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                    {p.name}
                  </h3>
                  <div className="text-xs space-y-1 text-slate-600 dark:text-emerald-100/75 tabular-nums">
                    <p>
                      Price: <strong className="text-slate-900 dark:text-white">{formatINR(p.price)}</strong>
                    </p>
                    <p>Pack Size: {p.weight}</p>
                    <p>Department: {p.category}</p>
                    <p>Rating: {p.rating} ★</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => addToCart(p.id, 1)}
                      className="flex-1 py-2 rounded-lg bg-[#047857] text-white text-xs font-heading font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCompare(p.id)}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-emerald-800 text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AuthModal() {
  const { authOpen, setAuthOpen, loginUser, registerUser } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('priya@ravisupermarket.in');
  const [phone, setPhone] = useState('+91 98401 44510');
  const [password, setPassword] = useState('customer123');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginUser(email, password);
      } else {
        await registerUser(name, email, phone, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotateX: -12 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.94, rotateX: 12 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900 shadow-2xl p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign In to RAVI' : 'Create Shopper Account'}
              </h2>
              <button
                type="button"
                onClick={() => setAuthOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-950 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#0D1A14]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-heading font-semibold cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#047857] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-emerald-200/70'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-heading font-semibold cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-[#047857] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-emerald-200/70'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile Number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
                  />
                </>
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-sm cursor-pointer"
              >
                {submitting ? 'Signing in...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {mode === 'login' && (
              <div className="pt-2 border-t border-slate-100 dark:border-emerald-950 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('priya@ravisupermarket.in');
                    setPassword('customer123');
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-[#13251D] text-[11px] font-medium cursor-pointer"
                >
                  Fill Shopper Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@ravisupermarket.in');
                    setPassword('admin123');
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-[#13251D] text-[11px] font-medium cursor-pointer"
                >
                  Fill Admin Demo
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function GstInvoiceModal({
  order,
  onClose,
}: {
  order: SupermarketOrder | null;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, rotateX: -10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-emerald-900/60 pb-4">
          <div>
            <p className="font-mono text-xs text-[#047857] dark:text-[#34D399] font-semibold">
              TAX INVOICE · GSTIN 33AABCR4412L1ZV
            </p>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mt-1">
              RAVI SUPERMARKET · {order.orderNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-[#047857] text-white text-xs font-heading font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-950 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14]">
            <p className="font-semibold text-slate-800 dark:text-white mb-1">Billed To</p>
            <p>{order.customerName}</p>
            <p>{order.address.line1}, {order.address.area}</p>
            <p>{order.address.city} - {order.address.pincode}</p>
            <p className="tabular-nums">{order.customerPhone}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] tabular-nums">
            <p className="font-semibold text-slate-800 dark:text-white mb-1">Fulfillment</p>
            <p>Slot: {order.deliverySlot}</p>
            <p>Payment: {order.paymentMethod} ({order.paymentStatus})</p>
            <p>Status: {order.status}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left border-collapse tabular-nums">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-900 text-slate-500">
              <th className="py-2">Product</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">GST</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-emerald-950">
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">
                  {item.name}
                </td>
                <td className="py-2.5 text-right">{item.quantity}</td>
                <td className="py-2.5 text-right">{item.gstPercent}%</td>
                <td className="py-2.5 text-right font-semibold">{formatINR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-slate-200 dark:border-emerald-900 pt-3 space-y-1.5 text-xs tabular-nums">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-[#047857] dark:text-[#34D399]">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-{formatINR(order.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">GST Tax</span>
            <span>{formatINR(order.gstAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cold-Chain Delivery</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : formatINR(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-display font-bold pt-2 border-t border-slate-200 dark:border-emerald-900 text-slate-900 dark:text-white">
            <span>Grand Total</span>
            <span>{formatINR(order.totalAmount)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
