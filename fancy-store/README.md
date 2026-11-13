# RAVI FANCY STORE — Standalone Codebase

Complete, deployment-ready source folder for **RAVI FANCY STORE**, a full-stack e-commerce storefront and admin portal for ladies' fancy accessories, bridal jewellery, hair ornaments, and cosmetics.

## Folder Structure

```text
fancy-store/
├── .env.example
├── README.md
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── store-images/          # 51 product, category & boutique images (copied to dist/store-images on build)
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── AdminDashboard.tsx
    │   ├── CartDrawer.tsx
    │   ├── CategoriesView.tsx
    │   ├── CheckoutView.tsx
    │   ├── Footer.tsx
    │   ├── HomeView.tsx
    │   ├── InfoPages.tsx
    │   ├── Navbar.tsx
    │   ├── OrderTrackingView.tsx
    │   ├── ProductCard.tsx
    │   ├── ProductDetailView.tsx
    │   ├── ResilientImage.tsx
    │   └── ShopView.tsx
    ├── server/
    │   ├── db.ts
    │   └── seedProducts.ts    # 12 categories & 48 products with 48 unique product images
    ├── types/
    │   └── store.ts
    └── utils/
        └── currency.ts
```

## Quick Start

```bash
cd fancy-store
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Production Build & Deploy

```bash
npm run build
npm start
```

- `npm run build` bundles the Vite React frontend into `dist/` and copies all 51 images from `public/store-images/` into `dist/store-images/`.
- `npm start` runs `node server.ts` natively (Node 22+ TypeScript support), serving API routes, `/store-images/*`, and the built SPA from `dist/`.
- Default Admin Dashboard password (override with `ADMIN_PASSWORD` in `.env`): `ravi-admin-2026`.
- Optional `MONGODB_URI` connects to MongoDB; when omitted, data persists automatically in `data/ravi-fancy-store.json`.
