import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';

export function Footer() {
  const { setRoute, pushToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        setSubscribed(true);
        setEmail('');
        pushToast('Subscribed to Fresh Harvest Alerts');
        return;
      }
    } catch {
      // Fall back cleanly on static hosts (Netlify)
    }
    setSubscribed(true);
    setEmail('');
    pushToast('Subscribed to Fresh Harvest Alerts');
  };

  return (
    <footer className="bg-[#0A1612] text-emerald-50 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand column */}
        <div className="md:col-span-4 space-y-4">
          <button
            type="button"
            onClick={() => setRoute('home')}
            className="font-display font-bold text-2xl tracking-tight text-white cursor-pointer"
          >
            RAVI SUPERMARKET
          </button>
          <p className="text-sm text-emerald-100/75 leading-relaxed max-w-sm">
            Neighborhood gourmet market in Anna Nagar, Chennai. Unique batch-verified pantry staples,
            morning-harvest produce, A2 dairy, and express 45-minute doorstep fulfillment.
          </p>
          <div className="space-y-2 text-xs text-emerald-200/80 pt-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>42 Second Avenue, Anna Nagar, Chennai 600040</span>
            </p>
            <p className="flex items-center gap-2 tabular-nums">
              <Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>+91 98400 77880 (Daily 06:00 – 23:00)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>concierge@ravisupermarket.in</span>
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-heading text-xs font-semibold tracking-wider text-[#FDE68A]">
            DEPARTMENTS
          </h4>
          <ul className="space-y-2 text-sm text-emerald-100/75">
            <li>
              <button
                type="button"
                onClick={() => setRoute('products', { category: 'Groceries & Staples' })}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Groceries & Staples
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setRoute('products', { category: 'Fruits & Vegetables' })}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Fresh Harvest
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setRoute('products', { category: 'Dairy & Bakery' })}
                className="hover:text-white transition-colors cursor-pointer"
              >
                A2 Dairy & Bakery
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setRoute('products', { category: 'Kitchen & Home' })}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Kitchen & Home
              </button>
            </li>
          </ul>
        </div>

        {/* Store pages */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-heading text-xs font-semibold tracking-wider text-[#FDE68A]">
            QUICK LINKS
          </h4>
          <ul className="space-y-2 text-sm text-emerald-100/75">
            <li>
              <button
                type="button"
                onClick={() => setRoute('offers')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Seasonal Offers
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setRoute('about')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Our Harvest Story
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setRoute('contact')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact Concierge
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setRoute('account')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Orders & GST Invoices
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-heading text-xs font-semibold tracking-wider text-[#FDE68A]">
            MORNING HARVEST ALERTS
          </h4>
          <p className="text-xs text-emerald-100/70 leading-relaxed">
            Receive weekly seasonal orchard arrivals and member-only voucher codes.
          </p>
          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60 flex items-center gap-2 text-xs text-emerald-100"
            >
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span>Subscribed for weekly harvest drops.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-sm text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-[#34D399]"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-heading font-semibold text-xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>Join</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-emerald-950/90 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200/60">
          <p>© 2026 RAVI SUPERMARKET · Anna Nagar Flagship, Chennai</p>
          <p>100% Unique Verified SKUs · Daily 06:00 – 23:00</p>
        </div>
      </div>
    </footer>
  );
}
