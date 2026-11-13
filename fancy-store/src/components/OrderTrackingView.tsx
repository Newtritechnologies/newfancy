import React, { useEffect, useState } from 'react';
import { CheckCircle2, Package, Search, Truck } from 'lucide-react';
import { Order, OrderStatus } from '../types/store';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface OrderTrackingViewProps {
  initialQuery?: string;
  localOrderIds: string[];
}

const STEPS: OrderStatus[] = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialQuery = '',
  localOrderIds,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performLookup = async (searchText: string) => {
    const clean = searchText.trim();
    if (!clean) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(clean)}`);
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performLookup(initialQuery);
    } else if (localOrderIds.length > 0) {
      setQuery(localOrderIds[0]);
      performLookup(localOrderIds[0]);
    } else {
      // Load sample demo order so visitors can immediately see live tracking in action
      performLookup('RFS-2026-1002');
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(query);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#C94A70] mb-1.5">
          Live Order Status & History
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620]">
          Track Your Boutique Parcel
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#654552]">
          Enter your Order Number (e.g. RFS-2026-1001 or RFS-2026-1002), registered mobile number, or email address to check live packing and dispatch milestones.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#654552] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order Number (RFS-2026-1002), Phone, or Email"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-[#EADCE2] text-sm text-[#2D1620] focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {loading ? 'Checking...' : 'Track Order'}
        </button>
      </form>

      {localOrderIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#654552] font-medium">Your recent orders:</span>
          {localOrderIds.map((ordNum) => (
            <button
              key={ordNum}
              type="button"
              onClick={() => {
                setQuery(ordNum);
                performLookup(ordNum);
              }}
              className="px-3 py-1.5 rounded-md bg-[#F3EDF8] text-[#6B1D3A] font-mono font-medium hover:bg-[#FDE8EF] cursor-pointer"
            >
              {ordNum}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[#EADCE2] text-sm text-[#654552]">
          Fetching order timeline...
        </div>
      ) : searched && orders.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[#EADCE2]">
          <Package className="w-10 h-10 text-[#C69C53] mx-auto mb-3" />
          <h2 className="font-display text-xl font-semibold text-[#2D1620]">
            No orders found for “{query}”
          </h2>
          <p className="text-sm text-[#654552] mt-1">
            Double check your order number or try the phone number used during checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const activeStepIdx = STEPS.indexOf(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EADCE2]">
                  <div>
                    <div className="text-xs text-[#654552]">
                      Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <h2 className="font-mono text-xl font-semibold text-[#6B1D3A] mt-0.5 tabular-nums">
                      {order.orderNumber}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <span className="text-xs text-[#654552] block">Status</span>
                      <span className={`font-semibold ${isCancelled ? 'text-[#B91C1C]' : 'text-[#2D1620]'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#654552] block">Total Paid</span>
                      <span className="font-mono font-semibold text-[#2D1620] tabular-nums">
                        {formatINR(order.totalAmount)} ({order.paymentMethod})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {!isCancelled && (
                  <div className="grid grid-cols-5 gap-2">
                    {STEPS.map((step, idx) => {
                      const done = idx <= activeStepIdx;
                      return (
                        <div key={step} className="space-y-2">
                          <div
                            className={`h-2 rounded-full transition-colors ${
                              done ? 'bg-[#6B1D3A]' : 'bg-[#EADCE2]'
                            }`}
                          />
                          <div className="flex items-center gap-1 text-xs font-medium">
                            {done && <CheckCircle2 className="w-3.5 h-3.5 text-[#6B1D3A] shrink-0" />}
                            <span className={done ? 'text-[#2D1620]' : 'text-[#8D6F7B]'}>
                              {step}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Items */}
                  <div className="space-y-3">
                    <h3 className="font-display text-base font-semibold text-[#2D1620]">
                      Items in Parcel
                    </h3>
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 text-sm">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FAF4EE] shrink-0">
                          <ResilientImage
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[#2D1620] truncate">{item.name}</div>
                          <div className="text-xs text-[#654552] tabular-nums">
                            Qty {item.quantity} · {formatINR(item.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Updates & Shipping */}
                  <div className="space-y-3">
                    <h3 className="font-display text-base font-semibold text-[#2D1620] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#C69C53]" />
                      <span>Delivery & Updates</span>
                    </h3>
                    <p className="text-xs text-[#5C3B47] leading-relaxed bg-[#FCF8F4] p-3 rounded-lg border border-[#EADCE2]">
                      {order.customer.fullName} · {order.customer.addressLine1}, {order.customer.city} {order.customer.pincode} ({order.customer.phone})
                    </p>
                    <ul className="space-y-2 text-xs text-[#5C3B47]">
                      {[...order.statusHistory].reverse().map((h, i) => (
                        <li key={i} className="flex justify-between gap-2 border-b border-[#EADCE2]/70 pb-1.5 last:border-0">
                          <span>
                            <strong className="text-[#2D1620]">{h.status}:</strong> {h.note}
                          </span>
                          <span className="font-mono text-[11px] text-[#8D6F7B] shrink-0 tabular-nums">
                            {new Date(h.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
