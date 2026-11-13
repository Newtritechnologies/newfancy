import React from 'react';
import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { CategoryItem } from '../types/store';
import { PageRoute } from './Navbar';

interface FooterProps {
  categories: CategoryItem[];
  onNavigate: (page: PageRoute) => void;
  onSelectCategory: (categoryName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  onNavigate,
  onSelectCategory,
}) => {
  return (
    <footer className="bg-[#2D1620] text-[#FAF4EE] border-t border-[#4B2736]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="font-display text-2xl font-bold tracking-tight text-white cursor-pointer text-left"
            >
              RAVI FANCY STORE
            </button>
            <p className="text-sm text-[#E5D4DC] leading-relaxed max-w-sm">
              Your trusted ladies’ boutique for handcrafted bridal jewellery, temple jumkas, silk-thread bangles, hair accessories, bindis, and velvet-finish cosmetics.
            </p>
            <div className="space-y-2 text-xs text-[#E5D4DC]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C69C53] shrink-0 mt-0.5" />
                <span>28 Pearl Bazaar Lane, T. Nagar, Chennai 600017</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C69C53] shrink-0" />
                <span className="font-mono">+91 98400 72145</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C69C53] shrink-0" />
                <span>care@ravifancystore.in</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/919840072145"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp RAVI FANCY STORE"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#F3D799]" />
                <span>WhatsApp</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram RAVI FANCY STORE"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#F3D799]" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="font-display text-base font-semibold text-[#F3D799] mb-4">
              Boutique Categories
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-[#E5D4DC]">
              {categories.slice(0, 12).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.name)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-display text-base font-semibold text-[#F3D799] mb-4">
                Customer Care
              </h3>
              <ul className="space-y-2.5 text-sm text-[#E5D4DC]">
                <li>
                  <button type="button" onClick={() => onNavigate('about')} className="hover:text-white cursor-pointer">
                    About Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('contact')} className="hover:text-white cursor-pointer">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('tracking')} className="hover:text-white cursor-pointer">
                    Track Order
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('faq')} className="hover:text-white cursor-pointer">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-base font-semibold text-[#F3D799] mb-4">
                Policies & Store
              </h3>
              <ul className="space-y-2.5 text-sm text-[#E5D4DC]">
                <li>
                  <button type="button" onClick={() => onNavigate('privacy')} className="hover:text-white cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('terms')} className="hover:text-white cursor-pointer">
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('refund')} className="hover:text-white cursor-pointer">
                    Return & Refund
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('admin')} className="text-[#F3D799] hover:text-white cursor-pointer">
                    Admin Dashboard
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#CDB6C0]">
          <span>© {new Date().getFullYear()} RAVI FANCY STORE. All rights reserved.</span>
          <span>UPI · Google Pay · PhonePe · Razorpay · Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
};
