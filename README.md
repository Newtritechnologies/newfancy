# RAVI FANCY STORE — Boutique Jewellery, Hair Accessories & Cosmetics

RAVI FANCY STORE is a full-stack e-commerce storefront and admin portal built with **React 19, TypeScript, Tailwind CSS v4, Motion, Express, and MongoDB (with resilient local JSON persistence)**.

## Highlights

- **Curated Ladies' Catalog**: 12 categories (`Hair Clips`, `Hair Pins`, `Chains`, `Jumkas`, `Earrings`, `Bindis`, `Nose Pins`, `Rings`, `Bangles`, `Necklaces`, `Makeup Products`, `Beauty Accessories`) with 48 unique items and dedicated photography.
- **Shopping & Checkout**: Persistent cart drawer, promo codes (`RAVI10`, `BRIDAL15`), UPI / Card / NetBanking / Cash on Delivery / Razorpay Test checkout, and real-time order tracking (`RFS-2026-*`).
- **Admin Dashboard**: Protected inventory, category, image upload, order lifecycle management, and sales analytics (`POST /api/admin/login`).
- **Deployment Ready**: All 51 store images live in `public/store-images/` so Vite copies them cleanly into `dist/store-images/` on build.

## Running Locally

```bash
npm install
npm run dev
```

## Production Build & Start

```bash
npm run build
npm start
```
