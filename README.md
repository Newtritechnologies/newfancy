# RAVI SUPERMARKET — Full-Stack Online Grocery & Superstore Platform

RAVI SUPERMARKET is a full-stack commercial supermarket e-commerce web application built with **React 19, TypeScript, Tailwind CSS v4 (Light & Dark Mode), Motion, Express, MongoDB (with resilient JSON store), and `@google/genai`**.

## Key Features

- **1,080+ Seeded Unique Products Across 12 Departments**: Groceries & Staples, Fruits & Vegetables, Dairy & Bakery, Snacks & Beverages, Personal Care, Household Essentials, Baby Care, Beauty & Cosmetics, Kitchen & Home, Electronics & Accessories, Stationery, and Frozen & Packaged Foods.
- **Server-Side Paginated Search & Faceted Filtering**: Instant autocomplete suggestions, subcategory & multi-brand filtering, price range slider, discount & rating filters, availability toggle, sorting, recently viewed tray, and side-by-side product comparison.
- **Customer Accounts & Order Tracking**: Sign up / sign in (`priya@ravisupermarket.in` / `ravi1234`), saved delivery addresses, wishlist sync, loyalty points & referral codes, live 5-step delivery tracking, and printable/downloadable GST Tax Invoices.
- **Express Checkout & Payments**: PIN code serviceability & slot selection, coupon codes (`FRESH10`, `SUPER15`, `WELCOME50`, `BULK20`), UPI / GPay / PhonePe / Cards / Net Banking / Cash on Delivery / Razorpay Test Mode verification, and WhatsApp order summary sharing.
- **Admin Operations Portal** (Footer -> Admin Portal, demo password `ravi-admin-2026`): Revenue analytics (`Daily / Weekly / Monthly`), low-stock alerts, product CRUD with multi-image upload, **CSV Bulk Upload** for 1,000+ SKUs, coupon/category/customer management, and live order status updates.
- **AI Smart Pantry Recommendations**: Powered server-side via `@google/genai` (`GEMINI_API_KEY`) with automatic grounded catalog-matching fallback.

## Environment Configuration

Copy `.env.example` to `.env` and configure any optional production integrations:

- `MONGODB_URI`: MongoDB Atlas or self-hosted URI (automatically creates indexes on `id`, `sku`, `category`, `brand`, `price` and seeds 1,080+ unique products if empty). When omitted, the app persists to `data/ravi-supermarket.json`.
- `ADMIN_PASSWORD`: Password to unlock `/api/admin/*` endpoints (defaults to `ravi-admin-2026`).
- `SESSION_SECRET`: HMAC-SHA256 secret for customer and admin session tokens.
- `GEMINI_API_KEY`: Gemini API key for server-side pantry & product pairing recommendations.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Optional Razorpay Test Mode API credentials.

## Commands

```bash
npm install
npm run dev      # Starts Express + Vite on port 3000
npm run build    # Compiles React SPA to dist/
npm run start    # Runs production server directly via node server.ts
npm run lint     # TypeScript type-check (tsc --noEmit)
```
