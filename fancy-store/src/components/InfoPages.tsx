import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { ABOUT_BOUTIQUE_IMG } from '../utils/currency';
import { PageRoute } from './Navbar';
import { ResilientImage } from './ResilientImage';

interface InfoPagesProps {
  page: 'about' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund';
  onNavigate: (page: PageRoute) => void;
}

const FAQS = [
  {
    q: 'Are your jewellery pieces hypoallergenic and nickel-free?',
    a: 'Yes. All RAVI FANCY STORE earrings, jumkas, nose pins, and daily chains are crafted with nickel-free alloys, surgical steel posts, or skin-friendly 18k/22k plating.',
  },
  {
    q: 'How long does delivery take across India?',
    a: 'Orders placed before 2:00 PM IST dispatch the same business day from our Chennai boutique. Metro deliveries take 2–4 business days and other PIN codes take 4–6 business days.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD) and UPI?',
    a: 'Yes, we accept UPI, Google Pay, PhonePe, cards/netbanking via Razorpay, and Cash on Delivery across 18,000+ Indian PIN codes.',
  },
  {
    q: 'How do I care for kundan, pearl, and silk-thread bangles?',
    a: 'Always apply perfume, hairspray, and lotions before putting on your jewellery. Wipe gently with a dry cotton cloth after wear and store inside the cushioned velvet box provided.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'Unworn jewellery and unopened cosmetics with original tags qualify for a 7-day easy exchange or refund. Bridal sets and pierced nose studs are eligible for exchange if damaged in transit.',
  },
];

export const InfoPages: React.FC<InfoPagesProps> = ({ page, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });

  if (page === 'about') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
            <p className="text-sm font-medium text-[#C94A70]">Our Story · T. Nagar, Chennai</p>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#2D1620] leading-tight text-balance">
              Celebrating Everyday Grace & Bridal Tradition
            </h1>
            <p className="text-base text-[#5C3B47] leading-relaxed">
              Founded in the heart of Chennai’s jewellery quarter, RAVI FANCY STORE began with a simple promise: every woman deserves finely finished adornments, hair ornaments, and cosmetics that feel effortless to wear from morning temple visits to midnight wedding receptions.
            </p>
            <p className="text-base text-[#5C3B47] leading-relaxed">
              Today our curators work directly with artisans in Jaipur, Firozabad, Coimbatore, and Mumbai—bringing hand-foiled kundan necklaces, featherweight hollow jumkas, resham silk bangles, and cruelty-free matte cosmetics straight to your vanity.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] cursor-pointer"
              >
                Explore the Boutique
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 rounded-lg border border-[#EADCE2] bg-white text-[#2D1620] text-sm font-semibold hover:bg-[#FDE8EF] cursor-pointer"
              >
                Visit or Contact Us
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#EADCE2] min-h-[320px]">
            <ResilientImage
              src={ABOUT_BOUTIQUE_IMG}
              alt="RAVI FANCY STORE boutique interior display"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-[#EADCE2]">
            <div className="font-display text-3xl font-semibold text-[#6B1D3A] tabular-nums">12</div>
            <div className="font-semibold text-[#2D1620] mt-1">Curated Departments</div>
            <p className="text-sm text-[#654552] mt-1.5">
              Complete matching across hair ornaments, bridal jewellery, bangles, bindis, and cosmetics.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-[#EADCE2]">
            <div className="font-display text-3xl font-semibold text-[#6B1D3A] tabular-nums">48 Hours</div>
            <div className="font-semibold text-[#2D1620] mt-1">Metro Dispatch Speed</div>
            <p className="text-sm text-[#654552] mt-1.5">
              Every piece undergoes clasp, stone-setting, and polish inspection before velvet-box sealing.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-[#EADCE2]">
            <div className="font-display text-3xl font-semibold text-[#6B1D3A] tabular-nums">18,000+</div>
            <div className="font-semibold text-[#2D1620] mt-1">PIN Codes Served</div>
            <p className="text-sm text-[#654552] mt-1.5">
              Pan-India express shipping with UPI, Google Pay, PhonePe, and Cash on Delivery support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#C94A70] mb-1.5">We Are Here to Help</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620]">
            Contact RAVI FANCY STORE
          </h1>
          <p className="mt-2 text-base text-[#654552]">
            Need saree-matching shade guidance, bulk wedding return-gift quotes, or order assistance? Reach our boutique stylists directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl bg-white border border-[#EADCE2] space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6B1D3A] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-sm text-[#2D1620]">Flagship Boutique</h2>
                  <p className="text-sm text-[#5C3B47] mt-0.5">
                    28 Pearl Bazaar Lane, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#6B1D3A] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-sm text-[#2D1620]">Phone & Boutique Hours</h2>
                  <p className="text-sm text-[#5C3B47] font-mono mt-0.5">+91 98400 72145</p>
                  <p className="text-xs text-[#654552] mt-0.5">Mon – Sun · 10:00 AM to 9:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#6B1D3A] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-sm text-[#2D1620]">Customer Care Email</h2>
                  <p className="text-sm text-[#5C3B47] mt-0.5">care@ravifancystore.in</p>
                </div>
              </div>

              <a
                href="https://wa.me/919840072145?text=Hello%20RAVI%20FANCY%20STORE%2C%20I%20would%20like%20assistance%20choosing%20jewellery."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8">
            {contactSent ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#6B1D3A] mx-auto" />
                <h2 className="font-display text-2xl font-semibold text-[#2D1620]">
                  Inquiry Received
                </h2>
                <p className="text-sm text-[#654552] max-w-md mx-auto">
                  Thank you, {contactForm.name}. Our T. Nagar boutique desk will call or message you within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactSent(false);
                    setContactForm({ name: '', phone: '', message: '' });
                  }}
                  className="mt-4 px-5 py-2.5 rounded-lg bg-[#FDE8EF] text-[#6B1D3A] text-xs font-semibold cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                }}
                className="space-y-4"
              >
                <h2 className="font-display text-2xl font-semibold text-[#2D1620]">
                  Send a Styling or Order Message
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                      Phone or Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+91 98400 72145"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Share your saree colour, bridal set question, or order number..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (page === 'faq') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <p className="text-sm font-medium text-[#C94A70] mb-1">Help Center</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620]">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="bg-white rounded-xl border border-[#EADCE2] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display text-lg font-semibold text-[#2D1620]">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#6B1D3A] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-[#5C3B47] leading-relaxed border-t border-[#EADCE2]/70 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const legalContent: Record<'privacy' | 'terms' | 'refund', { title: string; sections: { heading: string; body: string }[] }> = {
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: '1. Information We Collect',
          body: 'When you browse or place an order at RAVI FANCY STORE, we collect your name, delivery address, phone number, email address, and order items strictly to fulfill shipping, send tracking notifications, and assist with customer care.',
        },
        {
          heading: '2. Payment Security',
          body: 'Online payments via UPI, Google Pay, PhonePe, or Razorpay are processed over encrypted payment rails. RAVI FANCY STORE never stores your card numbers, CVV, or UPI PINs.',
        },
        {
          heading: '3. Data Protection & Contact',
          body: 'We do not sell or rent customer details to third parties. To update or delete your order records, email care@ravifancystore.in.',
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      sections: [
        {
          heading: '1. Boutique Orders & Pricing',
          body: 'All product prices are listed in Indian Rupees (INR) inclusive of applicable taxes. Promotional codes such as RAVI10 and BRIDAL15 apply cleanly at checkout when minimum cart thresholds are met.',
        },
        {
          heading: '2. Handcrafted Finish Variance',
          body: 'Because kundan foiling, meenakari painting, and silk-thread bangles are crafted by hand, minor artisanal variations in bead placement or finish celebrate the uniqueness of each piece.',
        },
        {
          heading: '3. Dispatch & Delivery',
          body: 'Orders are dispatched via verified courier partners. Please ensure accurate 6-digit PIN codes and reachable mobile numbers for smooth Cash on Delivery or courier handoff.',
        },
      ],
    },
    refund: {
      title: 'Return & Refund Policy',
      sections: [
        {
          heading: '1. 7-Day Easy Return Window',
          body: 'Unworn jewellery, hair accessories, and unopened cosmetic seals may be returned or exchanged within 7 calendar days of delivery with original velvet packaging intact.',
        },
        {
          heading: '2. Transit Damage Guarantee',
          body: 'If a necklace, glass bangle set, or pressed eyeshadow palette arrives damaged, share an unboxing photograph on WhatsApp (+91 98400 72145) within 48 hours for an immediate complimentary replacement or full refund.',
        },
        {
          heading: '3. Refund Timelines',
          body: 'Approved refunds for UPI, Google Pay, PhonePe, and Razorpay orders credit back within 3–5 business days. Cash on Delivery refunds are settled via instant UPI or bank transfer.',
        },
      ],
    },
  };

  const doc = legalContent[page];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#EADCE2] pb-6">
        <p className="text-sm font-medium text-[#C94A70] mb-1">RAVI FANCY STORE Policies</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2D1620]">
          {doc.title}
        </h1>
      </div>

      <div className="space-y-6">
        {doc.sections.map((sec) => (
          <section key={sec.heading} className="bg-white rounded-xl border border-[#EADCE2] p-6 space-y-2">
            <h2 className="font-display text-xl font-semibold text-[#6B1D3A]">{sec.heading}</h2>
            <p className="text-sm sm:text-base text-[#5C3B47] leading-relaxed">{sec.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};
