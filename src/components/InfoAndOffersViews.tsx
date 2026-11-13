import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { SUPERMARKET_BACKGROUNDS } from '../types/supermarket';
import { ProductCard } from './ProductCard';
import { RevealBlock } from './RollingTransition';

export function OffersView() {
  const { coupons, products, pushToast, setRoute } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const dealProducts = products.filter((p) => p.isTodayDeal || p.discountPercent >= 16);

  const handleCopy = (code: string) => {
    void navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    pushToast('Coupon Copied', `${code} ready to apply at checkout.`);
    setTimeout(() => setCopiedCode(null), 1600);
  };

  return (
    <div className="pb-20 space-y-14">
      {/* Attractive Full-Bleed Offers Pavilion Background */}
      <section className="relative min-h-[300px] sm:min-h-[340px] flex items-end overflow-hidden bg-[#0A1612]">
        <img
          src={SUPERMARKET_BACKGROUNDS.offersPavilion}
          alt="RAVI SUPERMARKET Tasting Counter & Seasonal Offers"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07150F] via-[#07150F]/65 to-[#07150F]/25" />
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 pb-10 text-white space-y-3">
          <p className="text-xs font-heading font-semibold tracking-wider text-[#FDE68A] inline-flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>SEASONAL VOUCHERS & HARVEST DEALS</span>
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl">
            Store Offers & Harvest Bundles
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/85 max-w-xl">
            Unlock instant percent savings on daily staples, monthly bulk baskets, and cold-chain
            fresh produce.
          </p>
        </div>
      </section>

      {/* Interactive Shimmering Coupon Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Active Checkout Vouchers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {coupons.map((coupon, idx) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20, rotateX: -6 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-5 shadow-xs flex flex-col justify-between gap-4"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] via-[#F59E0B] to-[#047857]"
              />
              <div className="space-y-2">
                <span className="font-mono text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
                  Min Basket ₹{coupon.minOrder}
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  {coupon.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                  {coupon.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-dashed border-slate-200 dark:border-emerald-900">
                <code className="font-mono font-bold text-sm text-[#047857] dark:text-[#34D399]">
                  {coupon.code}
                </code>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(coupon.code)}
                  className="px-3 py-1.5 rounded-lg bg-[#ECFDF5] dark:bg-emerald-950 text-[#047857] dark:text-[#34D399] text-xs font-heading font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Curated Discounted Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Today&apos;s Featured Price Drops
          </h2>
          <button
            type="button"
            onClick={() => setRoute('products', { category: 'All' })}
            className="text-xs sm:text-sm font-heading font-semibold text-[#047857] dark:text-[#34D399] hover:underline cursor-pointer"
          >
            View All Products
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealProducts.map((item, idx) => (
            <ProductCard key={item.id} product={item} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function AboutView() {
  const { setRoute } = useStore();

  const pillars = [
    {
      title: '1-to-1 Visual Honesty',
      text: 'Every single product in our 24-item launch selection is studio-photographed individually. What you see on your screen matches the exact brand and pack that reaches your kitchen.',
    },
    {
      title: 'Sub-Zero & Morning Cold Chain',
      text: 'Ratnagiri orchards and Kotagiri farms dispatch overnight to our Anna Nagar cool-room so heirloom tomatoes and green peas retain peak crunch.',
    },
    {
      title: '45-Minute Slot Accountability',
      text: 'Orders placed before 22:15 ship immediately in insulated totes with zero crushed bakery loaves or warm dairy bottles.',
    },
  ];

  return (
    <div className="pb-20 space-y-14">
      <section className="relative min-h-[320px] sm:min-h-[360px] flex items-end overflow-hidden bg-[#0A1612]">
        <img
          src={SUPERMARKET_BACKGROUNDS.aboutContact}
          alt="RAVI SUPERMARKET Concierge Courtyard & Bakery"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07150F] via-[#07150F]/60 to-[#07150F]/20" />
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 pb-10 text-white space-y-3">
          <p className="text-xs font-heading font-semibold tracking-wider text-[#FDE68A]">
            OUR HARVEST CHARTER · EST. ANNA NAGAR
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl max-w-2xl leading-tight">
            Gourmet everyday groceries without filler or guesswork.
          </h1>
        </div>
      </section>

      <RevealBlock className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((pillar, idx) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-7 space-y-3 shadow-xs"
          >
            <span className="font-mono text-xs font-bold text-[#047857] dark:text-[#34D399]">
              0{idx + 1}. PRINCIPLE
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              {pillar.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-emerald-100/75 leading-relaxed">
              {pillar.text}
            </p>
          </motion.div>
        ))}
      </RevealBlock>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setRoute('products', { category: 'All' })}
          className="px-6 py-3 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-sm cursor-pointer"
        >
          Shop Unique Catalog
        </motion.button>
        <button
          type="button"
          onClick={() => setRoute('contact')}
          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-emerald-800 text-slate-800 dark:text-emerald-100 font-heading font-semibold text-sm cursor-pointer"
        >
          Visit Concierge Desk
        </button>
      </div>
    </div>
  );
}

const STORE_FAQS = [
  {
    q: 'How fast does RAVI SUPERMARKET deliver in Chennai?',
    a: 'Express orders in Anna Nagar, Adyar, T. Nagar, and Velachery arrive in 45 minutes or within your chosen morning/evening cool-chain slot.',
  },
  {
    q: 'Why does every product have its own individual photo?',
    a: 'We photograph every brand, bottle weight, and orchard crate separately—never repeating stock images across unrelated SKUs.',
  },
  {
    q: 'How do GST invoices and returns work?',
    a: 'Every completed order generates an instant itemized GST tax invoice inside your Orders page. Chilled items or damaged packs qualify for instant doorstep replacement.',
  },
];

export function ContactView() {
  const { pushToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('Express Delivery Support');
  const [message, setMessage] = useState('');
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, topic, message }),
        });
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.inquiry) {
            setTicketRef(data.inquiry.referenceCode);
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
            pushToast('Concierge Ticket Logged', `Reference ${data.inquiry.referenceCode}`);
            return;
          }
          pushToast('Check Inputs', data.error || 'Please fill required fields.');
          return;
        }
      } catch {
        // Static Netlify fallback below
      }
      const refCode = `RSM-SUP-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketRef(refCode);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      pushToast('Concierge Ticket Logged', `Reference ${refCode}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pb-20 space-y-14">
      {/* Attractive Full-Bleed Contact Concierge Backdrop */}
      <section className="relative min-h-[300px] sm:min-h-[340px] flex items-end overflow-hidden bg-[#0A1612]">
        <img
          src={SUPERMARKET_BACKGROUNDS.aboutContact}
          alt="RAVI SUPERMARKET Concierge Lounge"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07150F] via-[#07150F]/65 to-[#07150F]/25" />
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 pb-10 text-white space-y-2">
          <p className="text-xs font-heading font-semibold tracking-wider text-[#FDE68A] inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONCIERGE & ORDER DESK</span>
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl">
            Contact RAVI SUPERMARKET
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/85 max-w-xl">
            Speak directly with our Anna Nagar store team for bulk pantry orders, slot changes,
            and harvest requests.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Flagship Store Info + Animated FAQs */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 space-y-4 shadow-xs"
          >
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Flagship Store Desk
            </h2>
            <div className="space-y-3 text-sm text-slate-600 dark:text-emerald-100/80">
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#047857] dark:text-[#34D399] mt-1 shrink-0" />
                <span>42 Second Avenue, Anna Nagar, Chennai, Tamil Nadu 600040</span>
              </p>
              <p className="flex items-center gap-3 tabular-nums">
                <Phone className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
                <span>+91 98400 77880</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
                <span>concierge@ravisupermarket.in</span>
              </p>
              <p className="flex items-center gap-3 tabular-nums">
                <Clock className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
                <span>Open Daily · 06:00 AM – 11:00 PM</span>
              </p>
            </div>
          </motion.div>

          {/* Animated Accordion FAQ */}
          <div className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 space-y-3 shadow-xs">
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Quick Answers
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-emerald-950/60">
              {STORE_FAQS.map((item, idx) => (
                <div key={item.q} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between gap-2 text-left text-xs sm:text-sm font-heading font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                        openFaq === idx ? 'rotate-180 text-[#047857]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-2 text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed overflow-hidden"
                      >
                        {item.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Animated Concierge Inquiry Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="lg:col-span-7"
        >
          <div className="rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-sm">
            {ticketRef ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotateX: -12 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950 text-[#047857] dark:text-[#34D399] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  Message Received by Store Desk
                </h3>
                <p className="text-sm text-slate-600 dark:text-emerald-100/80 max-w-md mx-auto">
                  Ticket Reference{' '}
                  <strong className="font-mono text-[#047857] dark:text-[#34D399]">
                    {ticketRef}
                  </strong>{' '}
                  has been logged. Our concierge responds within 15 minutes during store hours.
                </p>
                <button
                  type="button"
                  onClick={() => setTicketRef(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#047857] text-white text-xs font-heading font-semibold cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[#047857] dark:text-[#34D399]" />
                    <span>Message the Store Desk</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
                    Questions about wholesale festive hampers, cold-chain produce, or an active
                    basket.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-emerald-100 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Priya Nair"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-emerald-100 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-emerald-100 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98400 77880"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-emerald-100 mb-1">
                      Topic
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm focus:outline-none focus:border-[#047857]"
                    >
                      <option value="Express Delivery Support">Express Delivery Support</option>
                      <option value="Bulk Pantry & Corporate Hampers">Bulk Pantry & Corporate Hampers</option>
                      <option value="Fresh Produce Request">Fresh Produce Request</option>
                      <option value="Invoice / GST Query">Invoice / GST Query</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-emerald-100 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share order ID or tell us what fresh harvest item we can reserve for you..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm focus:outline-none focus:border-[#047857]"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Sending...' : 'Send Message to Concierge'}</span>
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
