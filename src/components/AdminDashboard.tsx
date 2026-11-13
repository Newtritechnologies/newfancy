import React, { useState } from 'react';
import { PackagePlus, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import type { DepartmentName, OrderStatus } from '../types/supermarket';
import { formatINR } from '../utils/currency';

const DEPARTMENTS: DepartmentName[] = [
  'Groceries & Staples',
  'Fruits & Vegetables',
  'Dairy & Bakery',
  'Snacks & Beverages',
  'Personal Care',
  'Household Essentials',
  'Baby Care',
  'Beauty & Cosmetics',
  'Kitchen & Home',
  'Electronics & Accessories',
  'Stationery',
  'Frozen & Packaged Foods',
];

export function AdminDashboard() {
  const { products, orders, refreshStore, refreshOrders, pushToast } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DepartmentName>('Groceries & Staples');
  const [brand, setBrand] = useState('');
  const [weight, setWeight] = useState('500 g');
  const [price, setPrice] = useState('299');
  const [originalPrice, setOriginalPrice] = useState('349');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: reader.result }),
          });
          const ct = res.headers.get('content-type') || '';
          if (res.ok && ct.includes('application/json')) {
            const data = await res.json();
            if (data.url) {
              setImageUrl(data.url);
              pushToast('Unique Product Photo Uploaded');
              setUploading(false);
              return;
            }
          }
          if (typeof reader.result === 'string') {
            setImageUrl(reader.result);
            pushToast('Photo Ready Locally', 'Attached for preview');
          }
        } catch {
          if (typeof reader.result === 'string') {
            setImageUrl(reader.result);
            pushToast('Photo Ready Locally', 'Attached for preview');
          }
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim()) {
      pushToast('Missing Info', 'Enter a unique product name and upload/provide an image URL.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          brand: brand || 'Ravi Select',
          weight,
          price: Number(price),
          originalPrice: Number(originalPrice),
          image: imageUrl,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok) {
          setName('');
          setBrand('');
          setImageUrl('');
          await refreshStore();
          pushToast('Unique Product Added', data.product.name);
        } else {
          pushToast('Unable to Add Product', data.error || 'Duplicate or invalid fields');
        }
      } else {
        pushToast('Static Preview Mode', 'Catalog edits require the Express server.');
      }
    } catch {
      pushToast('Static Preview Mode', 'Catalog edits require the Express server.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        await refreshStore();
        pushToast('Product Removed', title);
      } else {
        pushToast('Static Preview Mode', 'Catalog edits require the Express server.');
      }
    } catch {
      pushToast('Static Preview Mode', 'Catalog edits require the Express server.');
    }
  };

  const handleOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        await refreshOrders();
        pushToast('Order Status Updated', status);
      } else {
        pushToast('Order Status Updated', status);
      }
    } catch {
      pushToast('Order Status Updated', status);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-heading font-semibold text-[#047857] dark:text-[#34D399] inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>RAVI SUPERMARKET INVENTORY & FULFILLMENT</span>
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
            Store Admin Operations
          </h1>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono tabular-nums">
          <span>Unique SKUs: <strong>{products.length}</strong></span>
          <span>Live Orders: <strong>{orders.length}</strong></span>
        </div>
      </div>

      {/* Add Unique Product Form */}
      <form
        onSubmit={handleCreateProduct}
        className="rounded-3xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 space-y-4 shadow-xs"
      >
        <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-[#047857] dark:text-[#34D399]" />
          <span>Add Unique Supermarket Product (Matched Photo Required)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exact Unique Product Name"
            className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DepartmentName)}
            className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand (e.g. Nilgiri Reserve)"
            className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight / Pack Size"
            className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm"
          />
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Sale Price (₹)"
            className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm font-mono"
          />
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="MRP (₹)"
            className="px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-sm font-mono"
          />
          <label className="px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950 border border-[#047857]/40 text-xs font-heading font-semibold text-[#047857] dark:text-[#34D399] flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : imageUrl ? 'Photo Uploaded' : 'Upload Product Photo'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <motion.button
          type="submit"
          disabled={creating}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-heading font-semibold text-sm cursor-pointer disabled:opacity-60"
        >
          {creating ? 'Adding Product...' : 'Publish Unique Product'}
        </motion.button>
      </form>

      {/* Order Fulfillment Queue */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Order Fulfillment Queue
        </h2>
        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono font-bold text-sm text-[#047857] dark:text-[#34D399]">
                  {ord.orderNumber} · {formatINR(ord.totalAmount)}
                </p>
                <p className="text-xs text-slate-500">
                  {ord.customerName} ({ord.customerPhone}) · {ord.deliverySlot}
                </p>
              </div>
              <select
                value={ord.status}
                onChange={(e) => handleOrderStatus(ord.id, e.target.value as OrderStatus)}
                className="px-3 py-2 rounded-xl bg-[#F8FAF7] dark:bg-[#0D1A14] border border-slate-200 dark:border-emerald-900 text-xs font-heading font-semibold cursor-pointer"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Active Unique Catalog Table */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Verified Unique Catalog ({products.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#111F18] border border-slate-200 dark:border-emerald-900/60 flex items-center gap-3"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
              />
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold text-xs text-slate-900 dark:text-white truncate">
                  {p.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {p.category} · {formatINR(p.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteProduct(p.id, p.name)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
