# Boutique Commerce — Platform Boilerplate

Production-ready boilerplate for a boutique / stitched / unstitched apparel
e-commerce platform: Next.js storefront + admin panel, Express/TypeScript
API, PostgreSQL/Prisma, GPT-4o stylist, JWT auth (admin + customer), image
upload, and an admin-editable homepage (hero slider, fabric tiles, banner).

## Getting Started

### 1. Database + Backend
```bash
cd backend
cp .env.example .env      # set DATABASE_URL, OPENAI_API_KEY, JWT_SECRET
npm install
npm run prisma:migrate    # creates tables from ../prisma/schema.prisma
npm run prisma:generate
npm run prisma:seed       # sample product + shipping rates + a default admin user
npm run dev                # API on http://localhost:4000
```

The seed script prints a default admin login to the console:
**`admin@boutique.com` / `Admin@12345`** — change this password after first
login in any real deployment.

### 2. Storefront + Admin
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                  # Storefront on http://localhost:3000
```

- Storefront: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin` (redirects to `/admin/login`)
- Customer account: `http://localhost:3000/account/login` or `/account/register`

## What's Included

### Authentication (real login, not a shared key)
- Single `User` table with a `role` (`ADMIN` | `CUSTOMER`), bcrypt-hashed
  passwords, JWT sessions (`backend/src/services/auth.service.ts`).
- `POST /api/auth/register` (customer self-signup), `POST /api/auth/login`
  (shared by both roles — the JWT payload carries the role), `GET
  /api/auth/me`, `GET /api/auth/orders` (customer order history).
- `requireAdmin` middleware protects every `/api/admin/*` route by checking
  the JWT role server-side — there is no admin bypass via a client-side flag.
- Frontend: `useAuthStore` (Zustand) + `AdminAuthGuard` component that
  redirects non-admins away from `/admin/*` to `/admin/login`.
- Checkout links orders to the logged-in customer automatically (via
  `optionalAuth` on the checkout route) while still fully supporting guest
  checkout.

### Admin Panel (`/admin`)
- **Dashboard** — revenue, orders, AOV, low-stock count, status breakdown.
- **Products** — list, **Add Product**, and now **Edit Product**
  (`/admin/products/[id]/edit`) with a full variant-matrix editor (size,
  color, fabric option, price, stock — add/remove rows freely).
- **Image upload** — the product form and homepage editor both support
  drag-free file upload (multer → `backend/uploads/`, served at
  `/uploads/*`) alongside manual URL paste. Swap for S3/Cloudinary before a
  real launch (see Next Steps).
- **Orders** — status lifecycle dropdown per row.
- **Shipping Rates** — city → fee/ETA matrix.
- **Homepage Design** — edit the hero banner slider (image, heading,
  subheading, CTA button + link, add/remove slides), fabric filter tiles
  (image, name, link), the promo banner strip, and the featured-collection
  section title — all stored in a `SiteContent` JSON row and rendered live
  on the storefront homepage.

### Storefront Home Page
Real sections wired to live data, not placeholders:
`components/home/HeroCarousel.tsx` (auto-advancing, admin-configurable
slides), `FabricFilterTiles.tsx`, `FeaturedCollections.tsx` (products with
`isFeatured=true`), `NewArrivalsSlider.tsx` (horizontal scroll, newest
products) — assembled in `app/(storefront)/page.tsx`.

### Customer Accounts
`/account/login`, `/account/register`, `/account` (profile + order
history + logout). Header shows an account icon that links to login or
account depending on session state.

## Project Structure

```
boutique-commerce/
├── prisma/schema.prisma              # Shared schema (User w/ role, Product,
│                                      # Order, ShippingRate, SiteContent, …)
├── backend/
│   ├── prisma/seed.ts                # Seeds admin user + sample data
│   └── src/
│       ├── middleware/
│       │   ├── jwtAuth.ts            # requireAuth / requireAdmin / optionalAuth
│       │   └── upload.ts             # multer disk storage config
│       ├── services/
│       │   ├── auth.service.ts       # register/login/JWT
│       │   ├── admin.service.ts      # product/order/shipping/homepage CRUD
│       │   ├── checkout.service.ts   # stock-safe order transaction
│       │   ├── product.service.ts    # storefront query/filter/sort
│       │   ├── shipping.service.ts
│       │   └── ai.service.ts         # GPT-4o boutique stylist
│       └── routes/
│           ├── auth.routes.ts
│           ├── admin.routes.ts       # protected by requireAdmin
│           ├── homepage.routes.ts    # public read of homepage content
│           ├── product.routes.ts
│           ├── checkout.routes.ts
│           └── ai.routes.ts
└── frontend/src/
    ├── store/{useAuthStore,useCartStore}.ts
    ├── lib/api.ts                    # JWT-aware API client
    ├── components/
    │   ├── layout/{Header,Footer}.tsx
    │   ├── home/{HeroCarousel,FabricFilterTiles,FeaturedCollections,NewArrivalsSlider}.tsx
    │   ├── plp/{FilterSidebar,ProductGrid}.tsx
    │   ├── pdp/ProductDetail.tsx
    │   ├── cart/MiniCart.tsx
    │   ├── checkout/CheckoutForm.tsx
    │   ├── ai/ChatWidget.tsx
    │   └── admin/{ProductForm,AdminAuthGuard}.tsx
    └── app/
        ├── (storefront)/            # Header/Footer/Cart/Chat via layout.tsx
        │   ├── page.tsx             # Home (hero/tiles/featured/new arrivals)
        │   ├── collections/[slug]/page.tsx
        │   ├── products/[slug]/page.tsx
        │   ├── account/{login,register,page.tsx}
        │   ├── checkout/, order-confirmation/, track-order/, about/, contact/
        └── admin/                   # AdminAuthGuard-wrapped, own sidebar shell
            ├── login/page.tsx
            ├── page.tsx             # Dashboard
            ├── products/{page.tsx,new/,[id]/edit/}
            ├── orders/page.tsx
            ├── shipping/page.tsx
            └── homepage/page.tsx    # Hero/tiles/banner editor
```

## Architecture Notes

- **Auth model**: one `User` table, one `role` field, one JWT — simplest
  correct approach for a boilerplate. Split into separate `Admin`/`Customer`
  tables later only if their data genuinely diverges (e.g. admin audit
  logs, customer loyalty points).
- **Image uploads are local-disk** (`backend/uploads/`, gitignored) for
  zero-config local development. This does **not** survive redeploys on
  most hosts (Vercel/Railway ephemeral filesystems) — swap
  `middleware/upload.ts` for an S3/Cloudinary signed-upload flow before
  production.
- **Homepage CMS** is a single JSON blob (`SiteContent` table, key
  `"homepage"`) rather than a fully normalized schema — intentionally
  simple for a boilerplate; normalize into `HeroSlide`/`FabricTile` tables
  if you need per-row querying, scheduling, or A/B testing later.
- **Stock integrity**: `checkout.service.ts` validates and decrements stock
  inside a single Prisma `$transaction`.
- **AI stylist**: keyword-based catalog retrieval feeds GPT-4o; the system
  prompt forbids inventing products/prices.

## Suggested Next Steps

1. Swap local-disk uploads for S3/Cloudinary before deploying anywhere with
   an ephemeral filesystem.
2. Add password reset / email verification flows to `auth.service.ts`.
3. Add a wishlist store + `/wishlist` page (Header already has the icon).
4. Normalize `SiteContent` into real tables if the homepage needs
   scheduling, versioning, or multi-language content.
5. Add rate limiting to `/api/auth/*` beyond the existing per-minute cap if
   you expect adversarial traffic (already present via `authLimiter` in
   `server.ts`, tune as needed).
