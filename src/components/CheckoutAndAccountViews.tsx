import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Heart,
  PackageCheck,
  Receipt,
  Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import type { SupermarketOrder } from '../types/supermarket';
import { formatDateTime, formatINR } from '../utils/currency';
import { GstInvoiceModal } from './CartAndModals';
import { ProductCard } from './ProductCard';

export function CheckoutView() {
  const {
    cart,
    cartSubtotal,
    coupons,
    user,
    deliverySlot,
    deliveryArea,
    clearCart,
    addOrderRecord,
    setRoute,
    pushToast,
  } = useStore();

  const [fullName, setFullName] = useState(user?.name || 'Priya Nair');
  const [phone, setPhone] = useState(user?.phone || '+91 98401 44510');
  const [email, setEmail] = useState(user?.email || 'priya@ravisupermarket.in');
  const [line1, setLine1] = useState('14 Lotus Avenue, Block C');
  const [area, setArea] = useState(deliveryArea.split('·')[0].trim());
  const [pincode, setPincode] = useState('600040');
  const [paymentMethod, setPaymentMethod] =
    useState<SupermarketOrder['paymentMethod']>('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<SupermarketOrder | null>(null);

  const gstAmount = cart.reduce((acc, item) => {
    const p = item.product!;
    return acc + Math.round((p.price * item.quantity * p.gstPercent) / 100);
  }, 0);
  const deliveryFee = cartSubtotal >= 499 ? 0 : 39;
  const totalAmount = Math.max(0, cartSubtotal - appliedDiscount + gstAmount + deliveryFee);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const codeUpper = couponCode.trim().toUpperCase();
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeUpper, subtotal: cartSubtotal }),
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          pushToast('Coupon Not Applied', data.error || 'Check minimum order value');
          return;
        }
        setAppliedDiscount(data.discount);
        setAppliedCoupon(data.coupon.code);
        pushToast('Coupon Applied', `Saved ₹${data.discount} with ${data.coupon.code}`);
        return;
      }
    } catch {
      // Static client fallback below
    }
    const found = coupons.find((c) => c.code.toUpperCase() === codeUpper && c.active);
    if (!found) {
      pushToast('Coupon Not Applied', 'Invalid coupon code.');
      return;
    }
    if (cartSubtotal < found.minOrder) {
      pushToast('Coupon Not Applied', `Add ₹${found.minOrder - cartSubtotal} more for ${found.code}.`);
      return;
    }
    let disc =
      found.discountType === 'percent'
        ? Math.round((cartSubtotal * found.discountValue) / 100)
        : found.discountValue;
    if (found.maxDiscount) disc = Math.min(disc, found.maxDiscount);
    setAppliedDiscount(disc);
    setAppliedCoupon(found.code);
    pushToast('Coupon Applied', `Saved ₹${disc} with ${found.code}`);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        address: {
          id: `addr-${Date.now()}`,
          label: 'Delivery',
          fullName,
          phone,
          line1,
          area,
          city: 'Chennai',
          pincode,
        },
        deliverySlot,
        paymentMethod,
        couponCode: appliedCoupon,
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
      };
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.order) {
            addOrderRecord(data.order);
            clearCart();
            setConfirmedOrder(data.order);
            pushToast('Order Confirmed', `Order ${data.order.orderNumber} placed!`);
            return;
          }
          pushToast('Order Failed', data.error || 'Check required details.');
          return;
        }
      } catch {
        // Static Netlify fallback below
      }

      const fallbackOrder: SupermarketOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `RSM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: user?.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        address: payload.address,
        deliverySlot,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending COD' : 'Paid',
        status: 'Confirmed',
        couponCode: appliedCoupon,
        subtotal: cartSubtotal,
        couponDiscount: appliedDiscount,
        gstAmount,
        deliveryFee,
        totalAmount,
        items: cart.map((entry) => {
          const p = entry.product!;
          return {
            productId: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category,
            brand: p.brand,
            weight: p.weight,
            image: p.image,
            unitPrice: p.price,
            quantity: entry.quantity,
            gstPercent: p.gstPercent,
            lineTotal: p.price * entry.quantity,
          };
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addOrderRecord(fallbackOrder);
      clearCart();
      setConfirmedOrder(fallbackOrder);
      pushToast('Order Confirmed', `Order ${fallbackOrder.orderNumber} placed!`);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotateX: -14 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          className="rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900 p-8 sm:p-10 text-center space-y-5 shadow-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950 text-[#047857] dark:text-[#34D399] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <p className="font-mono text-xs font-bold text-[#047857] dark:text-[#34D399]">
            ORDER CONFIRMED · DISPATCHING SOON
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            Thank you, {confirmedOrder.customerName}!
          </h1>
          <p className="text-sm text-slate-600 dark:text-emerald-100/80">
            Order{' '}
            <strong className="font-mono text-slate-900 dark:text-white">
              {confirmedOrder.orderNumber}
            </strong>{' '}
            for <strong className="tabular-nums">{formatINR(confirmedOrder.totalAmount)}</strong>{' '}
            ({confirmedOrder.paymentMethod}) is locked for{' '}
            <strong>{confirmedOrder.deliverySlot}</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRoute('account')}
              className="px-6 py-3 rounded-xl bg-[#047857] text-white font-heading font-semibold text-sm cursor-pointer"
            >
              Track Order & View Invoice
            </button>
            <button
              type="button"
              onClick={() => setRoute('products', { category: 'All' })}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-emerald-800 text-sm font-heading font-semibold cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
        Express Checkout
      </h1>

      {cart.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900 p-12 text-center space-y-4">
          <p className="font-heading font-semibold text-lg">Your checkout basket is empty.</p>
          <button
            type="button"
            onClick={() => setRoute('products', { category: 'All' })}
            className="px-6 py-3 rounded-xl bg-[#047857] text-white font-heading font-semibold text-sm cursor-pointer"
          >
            Add Fresh Groceries
          </button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-7 space-y-4">
              <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#047857] dark:text-[#34D399]" />
                <span>Delivery Address & Slot</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Recipient Full Name"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
                />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for GST Invoice"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
              />
              <input
                type="text"
                required
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="House / Flat No. & Street"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Neighbourhood"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
                />
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="PIN Code"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm font-mono"
                />
              </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-7 space-y-4">
              <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#047857] dark:text-[#34D399]" />
                <span>Payment Method</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['UPI', 'Google Pay', 'PhonePe', 'Card', 'Cash on Delivery'] as const).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-3 rounded-xl border text-xs font-heading font-semibold cursor-pointer transition-all ${
                        paymentMethod === method
                          ? 'border-[#047857] bg-[#ECFDF5] dark:bg-emerald-950 text-[#047857] dark:text-[#34D399]'
                          : 'border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-emerald-100'
                      }`}
                    >
                      {method}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-7 space-y-5 sticky top-24">
              <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white">
                Order Summary ({cart.length} items)
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo code (FRESH10, WELCOME50)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-xs font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-[#D97706] text-white text-xs font-heading font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <div className="space-y-2 text-sm tabular-nums pt-2 border-t border-slate-100 dark:border-emerald-950">
                <div className="flex justify-between">
                  <span className="text-slate-500">Items Subtotal</span>
                  <span>{formatINR(cartSubtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#047857] dark:text-[#34D399]">
                    <span>Voucher ({appliedCoupon})</span>
                    <span>-{formatINR(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">GST Included Tax</span>
                  <span>{formatINR(gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cold-Chain Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-xl font-display font-bold pt-3 border-t border-slate-200 dark:border-emerald-900 text-slate-900 dark:text-white">
                  <span>Total Payable</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-sm cursor-pointer shadow-lg"
              >
                {submitting ? 'Confirming Order...' : `Confirm Order · ${formatINR(totalAmount)}`}
              </motion.button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function AccountView() {
  const { user, orders, wishlist, products, setAuthOpen, logoutUser } = useStore();
  const [invoiceOrder, setInvoiceOrder] = useState<SupermarketOrder | null>(null);

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-heading font-semibold text-[#047857] dark:text-[#34D399]">
            SHOPPER PORTAL
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            {user ? `Welcome, ${user.name}` : 'Orders & Saved Wishlist'}
          </h1>
        </div>
        {user ? (
          <button
            type="button"
            onClick={logoutUser}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs font-heading font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#047857] text-white text-xs font-heading font-semibold cursor-pointer"
          >
            Sign In / Switch Account
          </button>
        )}
      </div>

      {/* Order History */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-[#047857] dark:text-[#34D399]" />
          <span>Recent Orders & Live Status</span>
        </h2>

        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No recent orders recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orders.map((ord) => (
              <motion.div
                key={ord.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono font-bold text-sm text-[#047857] dark:text-[#34D399]">
                      {ord.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(ord.createdAt)}</p>
                  </div>
                  <span className="text-xs font-heading font-semibold text-amber-600 dark:text-amber-400">
                    {ord.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-emerald-100/80 space-y-1">
                  <p>
                    {ord.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                  </p>
                  <p className="tabular-nums font-semibold text-slate-900 dark:text-white pt-1">
                    Total: {formatINR(ord.totalAmount)} · {ord.paymentMethod}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInvoiceOrder(ord)}
                  className="px-3.5 py-2 rounded-lg bg-[#F1F5F0] dark:bg-[#162C22] text-xs font-heading font-semibold text-[#047857] dark:text-[#34D399] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View GST Tax Invoice</span>
                  <Receipt className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Wishlist */}
      <section className="space-y-5">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <span>Saved Wishlist ({wishlistedProducts.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedProducts.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      </section>

      <GstInvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
    </div>
  );
}
