import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Edit3,
  FolderKanban,
  Lock,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CategoryItem,
  Order,
  OrderStatus,
  Product,
  SalesReport,
} from '../types/store';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  categories: CategoryItem[];
  products: Product[];
  onRefreshStore: () => Promise<void>;
}

type AdminTab = 'reports' | 'products' | 'categories' | 'orders';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const TOKEN_KEY = 'rfs_admin_token';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  products,
  onRefreshStore,
}) => {
  const [token, setToken] = useState<string>(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('reports');
  const [report, setReport] = useState<SalesReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prodSearch, setProdSearch] = useState('');
  const [notice, setNotice] = useState('');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    category: 'Jumkas',
    price: 599,
    originalPrice: 799,
    offerLabel: 'Festive Deal',
    stock: 25,
    description: '',
    material: '',
    careInstructions: '',
    imageUrl: '/store-images/cat_jumkas_1794550857982.jpg',
    isTrending: false,
    isNewArrival: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    image: '/store-images/cat_earrings_1794550858107.jpg',
  });

  const adminHeaders = (extra?: Record<string, string>) => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  const loadAdminData = async (activeToken: string) => {
    const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : undefined;
    try {
      const [repRes, ordRes] = await Promise.all([
        fetch('/api/admin/reports', { headers }),
        fetch('/api/admin/orders', { headers }),
      ]);
      if (repRes.ok) {
        const repData = await repRes.json();
        setReport(repData.report);
      }
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }
    } catch {
      // ignore transient error
    }
  };

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch('/api/admin/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
          await loadAdminData(token);
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    verify();
  }, [token]);

  const showToast = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setAuthenticated(true);
      await loadAdminData(data.token);
    } catch {
      setAuthError('Unable to reach server.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setAuthenticated(false);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormState({
      name: '',
      category: categories[0]?.name || 'Jumkas',
      price: 499,
      originalPrice: 699,
      offerLabel: 'New Launch',
      stock: 25,
      description: '',
      material: '18k Rose-Gold Finish Alloy',
      careInstructions: 'Store dry in velvet pouch.',
      imageUrl: categories[0]?.image || '/store-images/cat_jumkas_1794550857982.jpg',
      isTrending: false,
      isNewArrival: true,
    });
    setShowProductForm(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormState({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice,
      offerLabel: prod.offerLabel,
      stock: prod.stock,
      description: prod.description,
      material: prod.material,
      careInstructions: prod.careInstructions,
      imageUrl: prod.images[0] || '/store-images/cat_jumkas_1794550857982.jpg',
      isTrending: prod.isTrending,
      isNewArrival: prod.isNewArrival,
    });
    setShowProductForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: adminHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            fileName: file.name,
            dataUrl: reader.result,
          }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setFormState((prev) => ({ ...prev, imageUrl: data.url }));
          showToast('Product image uploaded.');
        } else {
          showToast(data.error || 'Image upload failed.');
        }
      } catch {
        showToast('Upload error.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formState.name,
      category: formState.category,
      price: Number(formState.price),
      originalPrice: Number(formState.originalPrice),
      offerLabel: formState.offerLabel,
      stock: Number(formState.stock),
      description: formState.description,
      material: formState.material,
      careInstructions: formState.careInstructions,
      images: [formState.imageUrl, ...(editingProduct?.images.slice(1) || [])],
      isTrending: formState.isTrending,
      isNewArrival: formState.isNewArrival,
    };

    const url = editingProduct
      ? `/api/admin/products/${editingProduct.id}`
      : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowProductForm(false);
      await onRefreshStore();
      await loadAdminData(token);
      showToast(editingProduct ? 'Product updated.' : 'New product added.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    if (res.ok) {
      setConfirmDeleteId(null);
      await onRefreshStore();
      await loadAdminData(token);
      showToast('Product deleted.');
    }
  };

  const handleQuickStockOrPrice = async (
    prod: Product,
    patch: Partial<Pick<Product, 'stock' | 'price' | 'originalPrice'>>
  ) => {
    const res = await fetch(`/api/admin/products/${prod.id}`, {
      method: 'PUT',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      await onRefreshStore();
      await loadAdminData(token);
      showToast(`Updated ${prod.name}`);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(catForm),
    });
    if (res.ok) {
      setCatForm({
        name: '',
        description: '',
        image: '/store-images/cat_earrings_1794550858107.jpg',
      });
      await onRefreshStore();
      showToast('Category saved.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    if (res.ok) {
      await onRefreshStore();
      showToast('Category removed.');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadAdminData(token);
      showToast(`Order status updated to ${status}.`);
    }
  };

  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-sm text-[#654552]">
        Verifying boutique owner session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[#EADCE2] p-8 space-y-6">
          <div className="w-12 h-12 rounded-xl bg-[#FDE8EF] text-[#6B1D3A] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs font-medium text-[#C94A70]">Owner Portal</p>
            <h1 className="font-display text-2xl font-semibold text-[#2D1620] mt-1">
              RAVI FANCY STORE Admin
            </h1>
            <p className="text-sm text-[#654552] mt-1">
              Sign in to manage products, inventory, pricing, categories, orders, and sales reports.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter boutique owner password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
              />
            </div>

            {authError && (
              <div role="alert" className="text-xs text-[#B91C1C] bg-[#FEF2F2] p-2.5 rounded-lg">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] transition-colors cursor-pointer"
            >
              Sign In to Dashboard
            </button>

            <div className="pt-2 border-t border-[#EADCE2] flex items-center justify-between text-xs text-[#654552]">
              <span>
                Demo password: <code className="font-mono text-[#2D1620]">ravi-admin-2026</code>
              </span>
              <button
                type="button"
                onClick={() => setPassword('ravi-admin-2026')}
                className="text-[#6B1D3A] font-semibold hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    `${p.name} ${p.category}`.toLowerCase().includes(prodSearch.trim().toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADCE2] pb-6">
        <div>
          <p className="text-xs font-medium text-[#C94A70]">Boutique Operations</p>
          <h1 className="font-display text-3xl font-semibold text-[#2D1620]">
            RAVI FANCY STORE Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {notice && (
            <span className="text-xs font-medium text-[#6B1D3A] bg-[#FDE8EF] px-3 py-1.5 rounded-md">
              {notice}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#EADCE2] bg-white text-xs font-semibold text-[#2D1620] hover:bg-[#FDE8EF] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-[#F3EDF8] p-1.5 rounded-xl border border-[#EADCE2] w-fit">
        {[
          { id: 'reports' as AdminTab, label: 'Sales Reports', icon: BarChart3 },
          { id: 'products' as AdminTab, label: `Products (${products.length})`, icon: Package },
          { id: 'categories' as AdminTab, label: `Categories (${categories.length})`, icon: FolderKanban },
          { id: 'orders' as AdminTab, label: `Customer Orders (${orders.length})`, icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#6B1D3A] text-white'
                  : 'text-[#5C3B47] hover:text-[#2D1620]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'reports' && report && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-xl bg-white border border-[#EADCE2]">
              <div className="text-xs text-[#654552]">Total Revenue</div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#6B1D3A] mt-2 tabular-nums">
                {formatINR(report.totalRevenue)}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#EADCE2]">
              <div className="text-xs text-[#654552]">Total Orders</div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#2D1620] mt-2 tabular-nums">
                {report.totalOrders}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#EADCE2]">
              <div className="text-xs text-[#654552]">Avg. Order Value</div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#2D1620] mt-2 tabular-nums">
                {formatINR(report.averageOrderValue)}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#EADCE2]">
              <div className="text-xs text-[#654552]">Low Stock Products (≤10)</div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#C94A70] mt-2 tabular-nums">
                {report.lowStockCount}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#EADCE2] p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-[#2D1620]">
                Revenue by Category
              </h2>
              {report.revenueByCategory.length === 0 ? (
                <p className="text-sm text-[#654552]">No completed sales yet.</p>
              ) : (
                <div className="space-y-3">
                  {report.revenueByCategory.map((row) => {
                    const maxRev = report.revenueByCategory[0]?.revenue || 1;
                    const pct = Math.max(8, Math.round((row.revenue / maxRev) * 100));
                    return (
                      <div key={row.category} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#2D1620]">
                            {row.category} ({row.units} sold)
                          </span>
                          <span className="font-mono font-semibold text-[#6B1D3A] tabular-nums">
                            {formatINR(row.revenue)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#F3EDF8] overflow-hidden">
                          <div
                            className="h-full bg-[#C94A70] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#EADCE2] p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-[#2D1620]">
                Orders by Fulfillment Status
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ORDER_STATUSES.map((st) => (
                  <div key={st} className="p-4 rounded-xl bg-[#FCF8F4] border border-[#EADCE2]">
                    <div className="text-xs text-[#654552]">{st}</div>
                    <div className="font-mono text-2xl font-semibold text-[#2D1620] mt-1 tabular-nums">
                      {report.ordersByStatus[st] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <input
              type="search"
              value={prodSearch}
              onChange={(e) => setProdSearch(e.target.value)}
              placeholder="Filter inventory by product name or category..."
              className="w-full sm:max-w-md px-4 py-2.5 rounded-lg bg-white border border-[#EADCE2] text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
            />
            <button
              type="button"
              onClick={openAddProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#EADCE2] overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FCF8F4] border-b border-[#EADCE2] text-xs text-[#654552]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Sale Price</th>
                  <th className="py-3.5 px-4 font-semibold">MRP</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADCE2]">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FCF8F4]/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#FAF4EE] shrink-0">
                          <ResilientImage
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[#2D1620] max-w-[240px] truncate">
                            {prod.name}
                          </div>
                          <div className="text-xs text-[#654552] tabular-nums">
                            {prod.discountPercent}% Off · {prod.offerLabel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5C3B47] whitespace-nowrap">{prod.category}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <input
                        type="number"
                        min={1}
                        defaultValue={prod.price}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val > 0 && val !== prod.price) {
                            handleQuickStockOrPrice(prod, { price: val });
                          }
                        }}
                        aria-label={`Price for ${prod.name}`}
                        className="w-24 px-2 py-1 rounded border border-[#EADCE2] text-xs font-mono tabular-nums"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#654552] tabular-nums">
                      {formatINR(prod.originalPrice)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <input
                        type="number"
                        min={0}
                        defaultValue={prod.stock}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val !== prod.stock) {
                            handleQuickStockOrPrice(prod, { stock: val });
                          }
                        }}
                        aria-label={`Stock for ${prod.name}`}
                        className="w-20 px-2 py-1 rounded border border-[#EADCE2] text-xs font-mono tabular-nums"
                      />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditProduct(prod)}
                          className="p-2 rounded-lg border border-[#EADCE2] text-[#2D1620] hover:bg-[#FDE8EF] cursor-pointer"
                          aria-label={`Edit ${prod.name}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === prod.id ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(prod.id)}
                            className="p-2 rounded-lg border border-[#EADCE2] text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                            aria-label={`Delete ${prod.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAddCategory}
            className="lg:col-span-4 bg-white rounded-xl border border-[#EADCE2] p-6 space-y-4"
          >
            <h2 className="font-display text-xl font-semibold text-[#2D1620]">
              Add Store Category
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1">Name *</label>
              <input
                type="text"
                required
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="e.g. Anklets"
                className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1">Description</label>
              <textarea
                rows={3}
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="Short collection summary..."
                className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2D1620] mb-1">Image Path</label>
              <input
                type="text"
                value={catForm.image}
                onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] cursor-pointer"
            >
              Save Category
            </button>
          </form>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.category.toLowerCase() === cat.name.toLowerCase()
              ).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#EADCE2]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF4EE] shrink-0">
                      <ResilientImage
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-base font-semibold text-[#2D1620] truncate">
                        {cat.name}
                      </div>
                      <div className="text-xs text-[#654552] tabular-nums">{count} products</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    aria-label={`Delete category ${cat.name}`}
                    className="p-2 rounded-lg text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-10 bg-white rounded-xl border border-[#EADCE2] text-center text-sm text-[#654552]">
              No customer orders recorded yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#EADCE2] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#654552]">
                    <span className="font-mono font-semibold text-[#6B1D3A] text-sm tabular-nums">
                      {order.orderNumber}
                    </span>
                    <span>·</span>
                    <span>{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                    <span>·</span>
                    <span>
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-[#2D1620]">
                    {order.customer.fullName} ({order.customer.phone}) —{' '}
                    {order.customer.addressLine1}, {order.customer.city} {order.customer.pincode}
                  </div>
                  <div className="text-xs text-[#5C3B47]">
                    {order.items.map((i) => `${i.name} × ${i.quantity}`).join(' | ')}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-[#654552]">Total</div>
                    <div className="font-mono text-lg font-semibold text-[#6B1D3A] tabular-nums">
                      {formatINR(order.totalAmount)}
                    </div>
                  </div>

                  <div>
                    <label className="sr-only" htmlFor={`status-${order.id}`}>
                      Order Status
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="px-3 py-2 rounded-lg border border-[#EADCE2] bg-[#FCF8F4] text-xs font-semibold text-[#2D1620] focus:outline-none focus:ring-2 focus:ring-[#6B1D3A]"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showProductForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1620]/55 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#EADCE2] p-6 sm:p-8 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EADCE2] pb-4">
              <h2 className="font-display text-2xl font-semibold text-[#2D1620]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setShowProductForm(false)}
                className="p-2 rounded-lg text-[#5C3B47] hover:bg-[#FDE8EF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                    Category *
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                    Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formState.originalPrice}
                    onChange={(e) =>
                      setFormState({ ...formState, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formState.stock}
                    onChange={(e) => setFormState({ ...formState, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                    Offer Label
                  </label>
                  <input
                    type="text"
                    value={formState.offerLabel}
                    onChange={(e) => setFormState({ ...formState, offerLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                  Product Image (Upload file or paste URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={formState.imageUrl}
                    onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#EADCE2] text-xs font-mono"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#F3EDF8] border border-[#EADCE2] text-xs font-semibold text-[#6B1D3A] hover:bg-[#FDE8EF] cursor-pointer whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">Material</label>
                  <input
                    type="text"
                    value={formState.material}
                    onChange={(e) => setFormState({ ...formState, material: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D1620] mb-1">
                    Care Guide
                  </label>
                  <input
                    type="text"
                    value={formState.careInstructions}
                    onChange={(e) =>
                      setFormState({ ...formState, careInstructions: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#EADCE2] text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-5 pt-1 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isTrending}
                    onChange={(e) => setFormState({ ...formState, isTrending: e.target.checked })}
                    className="accent-[#6B1D3A]"
                  />
                  <span>Feature in Trending</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isNewArrival}
                    onChange={(e) => setFormState({ ...formState, isNewArrival: e.target.checked })}
                    className="accent-[#6B1D3A]"
                  />
                  <span>Mark as New Arrival</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EADCE2]">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-5 py-2.5 rounded-lg border border-[#EADCE2] text-sm font-medium text-[#5C3B47] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#6B1D3A] text-white text-sm font-semibold hover:bg-[#842449] cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
