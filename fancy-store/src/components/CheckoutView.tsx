import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
} from 'lucide-react';
import { Order, PaymentMethod } from '../types/store';
import { formatINR } from '../utils/currency';
import { CartEntry } from './CartDrawer';
import { ResilientImage } from './ResilientImage';

interface CheckoutViewProps {
  items: CartEntry[];
  onBackToShop: () => void;
  onOrderComplete: (order: Order) => void;
  onTrackOrder: (orderNumber: string) => void;
}

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
}[] = [
  { id: 'UPI', title: 'UPI Instant Pay', subtitle: 'Pay directly via any BHIM / UPI ID' },
  { id: 'Google Pay', title: 'Google Pay (GPay)', subtitle: 'Fast 1-tap UPI confirmation' },
  { id: 'PhonePe', title: 'PhonePe UPI', subtitle: 'Instant PhonePe wallet & bank transfer' },
  {
    id: 'Razorpay Test',
    title: 'Razorpay Test Mode (Cards / Netbanking / UPI)',
    subtitle: 'Simulated Razorpay sandbox gateway verification',
  },
  {
    id: 'Cash on Delivery',
    title: 'Cash on Delivery (COD)',
    subtitle: 'Pay in cash or UPI upon parcel arrival',
  },
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  items,
  onBackToShop,
  onOrderComplete,
  onTrackOrder,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoError, setPromoError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiHandle, setUpiHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const [razorpayModal, setRazorpayModal] = useState<{
    orderId: string;
    amount: number;
    mode: string;
  } | null>(null);

  const subtotal = items.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);

  let discountAmount = 0;
  if (appliedPromo === 'RAVI10' && subtotal >= 999) {
    discountAmount = Math.round(subtotal * 0.1);
  } else if (appliedPromo === 'BRIDAL15' && subtotal >= 2499) {
    discountAmount = Math.round(subtotal * 0.15);
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingFee = afterDiscount >= 799 || items.length === 0 ? 0 : 60;
  const totalAmount = afterDiscount + shippingFee;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    setPromoError('');
    if (!code) return;
    if (code === 'RAVI10') {
      if (subtotal < 999) {
        setPromoError('RAVI10 requires a minimum subtotal of ₹999.');
        return;
      }
      setAppliedPromo('RAVI10');
      return;
    }
    if (code === 'BRIDAL15') {
      if (subtotal < 2499) {
        setPromoError('BRIDAL15 requires a minimum subtotal of ₹2,499.');
        return;
      }
      setAppliedPromo('BRIDAL15');
      return;
    }
    setPromoError('Invalid promo code. Try RAVI10 or BRIDAL15.');
  };

  const finalizeOrder = async (razorpayOrderId?: string, razorpayPaymentId?: string) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(),
            city: city.trim(),
            state: stateName.trim(),
            pincode: pincode.trim(),
            deliveryNotes: deliveryNotes.trim(),
          },
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          paymentMethod,
          promoCode: appliedPromo || undefined,
          razorpayOrderId,
          razorpayPaymentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not complete checkout.');
      }
      setConfirmedOrder(data.order);
      onOrderComplete(data.order);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !pincode.trim()) {
      setErrorMsg('Please fill out all required delivery address fields.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (
      (paymentMethod === 'UPI' || paymentMethod === 'Google Pay' || paymentMethod === 'PhonePe') &&
      upiHandle.trim() &&
      !upiHandle.includes('@')
    ) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@okicici) or leave blank for quick app prompt.');
      return;
    }

    if (paymentMethod === 'Razorpay Test') {
      setSubmitting(true);
      try {
        const res = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to launch Razorpay Test Mode');
        setRazorpayModal({
          orderId: data.orderId,
          amount: totalAmount,
          mode: data.mode,
        });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Payment setup failed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    await finalizeOrder();
  };

  const handleConfirmRazorpayTest = async () => {
    if (!razorpayModal) return;
    setSubmitting(true);
    try {
      const verifyRes = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: razorpayModal.orderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
      setRazorpayModal(null);
      await finalizeOrder(verifyData.razorpayOrderId, verifyData.razorpayPaymentId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification error');
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-[#EADCE2] p-8 sm:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FDE8EF] text-[#6B1D3A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#C94A70]">
                Order Confirmed
              </p>
              <h1 className="font-display text-3xl font-semibold text-[#2D1620] mt-1">
                Thank you, {confirmedOrder.customer.fullName}
              </h1>
              <p className="text-sm text-[#654552] mt-1">
                Your RAVI FANCY STORE order{' '}
                <span className="font-mono font-semibold text-[#6B1D3A]">
                  {confirmedOrder.orderNumber}
                </span>{' '}
                is confirmed and queued for velvet-box packing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FCF8F4] border border-[#EADCE2] text-sm">
            <div>
              <div className="text-xs text-[#654552]">Payment Method</div>
              <div className="font-semibold text-[#2D1620] mt-0.5">
                {confirmedOrder.paymentMethod} ({confirmedOrder.paymentStatus})
              </div>
            </div>
            <div>
              <div className="text-xs text-[#654552]">Total Payable</div>
              <div className="font-mono font-semibold text-[#6B1D3A] mt-0.5 tabular-nums">
                {formatINR(confirmedOrder.totalAmount)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#654552]">Deliver To</div>
              <div className="font-semibold text-[#2D1620] mt-0.5">
                {confirmedOrder.customer.city} — {confirmedOrder.customer.pincode}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-[#2D1620]">
              Items Ordered
            </h2>
            {confirmedOrder.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 py-2.5 border-b border-[#EADCE2] last:border-0 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FAF4EE] shrink-0">
                    <ResilientImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[#2D1620] truncate">{item.name}</div>
                    <div className="text-xs text-[#654552] tabular-nums">
                      Qty {item.quantity} × {formatINR(item.price)}
                    </div>
                  </div>
                </div>
                <span className="font-mono font-semibold text-[#2D1620] tabular-nums shrink-0">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onTrackOrder(confirmedOrder.orderNumber)}
              className="px-6 py-3 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors cursor-pointer"
            >
              Track This Order
            </button>
            <button
              type="button"
              onClick={onBackToShop}
              className="px-6 py-3 rounded-lg border border-[#EADCE2] bg-white text-[#2D1620] text-sm font-semibold hover:bg-[#FDE8EF] transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#2D1620]">
          Your cart is empty
        </h1>
        <p className="text-sm text-[#654552] mt-2">
          Add jewellery, hair accessories, or cosmetics before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={onBackToShop}
          className="mt-6 px-6 py-3 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors cursor-pointer"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        type="button"
        onClick={onBackToShop}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B1D3A] hover:text-[#C94A70] mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping</span>
      </button>

      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620] mb-8">
        Checkout & Delivery
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Delivery Form */}
          <section className="bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EADCE2]">
              <Truck className="w-5 h-5 text-[#6B1D3A]" />
              <h2 className="font-display text-xl font-semibold text-[#2D1620]">
                1. Customer & Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Divya Natarajan"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 72145"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                Email Address (for tracking updates)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                House / Flat / Street Address *
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Door No, Building Name, Street"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                Landmark / Area (Optional)
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Near Temple / Apartment Gate"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Chennai"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Tamil Nadu"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="600017"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                Gift Note or Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Please gift-wrap for wedding gifting"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
              />
            </div>
          </section>

          {/* Payment Options */}
          <section className="bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EADCE2]">
              <CreditCard className="w-5 h-5 text-[#6B1D3A]" />
              <h2 className="font-display text-xl font-semibold text-[#2D1620]">
                2. Choose Payment Method
              </h2>
            </div>

            <div className="space-y-2.5">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === opt.id
                      ? 'border-[#6B1D3A] bg-[#FDE8EF]/60'
                      : 'border-[#EADCE2] hover:bg-[#FCF8F4]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="mt-1 accent-[#6B1D3A]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#2D1620]">{opt.title}</div>
                    <div className="text-xs text-[#654552] mt-0.5">{opt.subtitle}</div>
                  </div>
                </label>
              ))}
            </div>

            {(paymentMethod === 'UPI' ||
              paymentMethod === 'Google Pay' ||
              paymentMethod === 'PhonePe') && (
              <div className="pt-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2D1620] mb-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#6B1D3A]" />
                  <span>{paymentMethod} ID (Optional for instant collect)</span>
                </label>
                <input
                  type="text"
                  value={upiHandle}
                  onChange={(e) => setUpiHandle(e.target.value)}
                  placeholder="yourname@okaxis / yournumber@ybl"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                />
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-xl font-semibold text-[#2D1620] pb-3 border-b border-[#EADCE2]">
            Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h2>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FAF4EE] shrink-0">
                    <ResilientImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[#2D1620] truncate">{product.name}</div>
                    <div className="text-xs text-[#654552] tabular-nums">Qty {quantity}</div>
                  </div>
                </div>
                <span className="font-mono font-semibold text-[#2D1620] tabular-nums shrink-0">
                  {formatINR(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className="pt-4 border-t border-[#EADCE2] space-y-2">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D1620]">
              <Tag className="w-3.5 h-3.5 text-[#C94A70]" />
              <span>Promo Code (RAVI10 or BRIDAL15)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 rounded-lg border border-[#EADCE2] text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-lg bg-[#F3EDF8] text-[#6B1D3A] text-xs font-semibold hover:bg-[#FDE8EF] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-xs text-[#B91C1C]">{promoError}</p>}
            {appliedPromo && (
              <p className="text-xs text-[#6B1D3A] font-medium">
                Applied {appliedPromo}: Saving {formatINR(discountAmount)}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-[#EADCE2] space-y-2 text-sm">
            <div className="flex justify-between text-[#654552]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums text-[#2D1620]">{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#C94A70]">
                <span>Promo Discount ({appliedPromo})</span>
                <span className="font-mono tabular-nums">-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#654552]">
              <span>Express Delivery</span>
              <span className="font-mono tabular-nums text-[#2D1620]">
                {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold text-[#2D1620] pt-3 border-t border-[#EADCE2]">
              <span>Total Amount</span>
              <span className="font-mono text-xl text-[#6B1D3A] tabular-nums">
                {formatINR(totalAmount)}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div role="alert" className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {submitting
              ? 'Processing Order...'
              : paymentMethod === 'Cash on Delivery'
                ? `Place COD Order · ${formatINR(totalAmount)}`
                : `Pay ${formatINR(totalAmount)} & Place Order`}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-[#654552]">
            <ShieldCheck className="w-4 h-4 text-[#C69C53]" />
            <span>100% Authentic Boutique Quality · Safe Checkout</span>
          </div>
        </aside>
      </form>

      {/* Razorpay Test Mode Modal */}
      {razorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1620]/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EADCE2] pb-4">
              <div>
                <div className="text-xs font-medium text-[#C94A70]">
                  Razorpay Checkout · Test Mode
                </div>
                <h3 className="font-display text-xl font-semibold text-[#2D1620]">
                  RAVI FANCY STORE
                </h3>
              </div>
              <span className="font-mono text-lg font-semibold text-[#6B1D3A] tabular-nums">
                {formatINR(razorpayModal.amount)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FCF8F4] border border-[#EADCE2] text-xs space-y-1.5 text-[#5C3B47]">
              <div>
                <span className="font-semibold text-[#2D1620]">Gateway Order ID: </span>
                <span className="font-mono">{razorpayModal.orderId}</span>
              </div>
              <div>
                <span className="font-semibold text-[#2D1620]">Mode: </span>
                <span>{razorpayModal.mode === 'razorpay_api' ? 'Live Razorpay Test API' : 'Sandbox Test Simulator'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmRazorpayTest}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Verifying...' : 'Simulate Payment Success'}
              </button>
              <button
                type="button"
                onClick={() => setRazorpayModal(null)}
                className="px-4 py-3 rounded-lg border border-[#EADCE2] text-sm font-medium text-[#5C3B47] hover:bg-[#FAF4EE] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
