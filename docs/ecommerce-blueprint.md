# EcoSmok E-commerce Blueprint

This repository already contains the requested PostgreSQL, Prisma, Express, React, Tailwind, Zustand, and Stripe stack. The storefront currently runs on Next.js 14 rather than Vite; the module boundaries below are also the correct boundaries for a Vite migration if that becomes a requirement.

## Runtime Structure

```text
prisma/schema.prisma                 PostgreSQL domain model and relations
backend/src/server.ts                Express bootstrap, security middleware, routes
backend/src/routes/                   HTTP route composition
backend/src/controllers/              Request-to-service adapters
backend/src/services/                 Auth, products, checkout, shipping, payments
backend/src/middleware/               JWT, age verification, uploads, errors
frontend/src/app/(storefront)/       Storefront pages and layouts
frontend/src/components/              Age gate, navigation, cart, PLP, PDP, checkout
frontend/src/store/                   Zustand auth and cart state
frontend/src/lib/api.ts               Typed API boundary and auth headers
```

## Data Model

The central relation is:

```text
User 1---* Order 1---* OrderItem *---1 ProductVariant *---1 Product *---1 Category
```

`Product` stores catalog-level data and `ProductVariant` stores the purchasable SKU, price, stock, flavour, and nicotine strength. The schema also keeps product images, reviews, coupons, shipping rates, CMS content, and rewards in the same Prisma client so admin and storefront workflows share one source of truth. Product and variant indexes support category/status listings, SKU lookup, stock checks, and nicotine filtering.

Apply schema changes with:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name vape_variant_metadata
```

## API Contract

| Area | Endpoint | Responsibility |
| --- | --- | --- |
| Auth | `POST /api/auth/register` | Customer registration and JWT issue |
| Auth | `POST /api/auth/login` | Customer/admin login |
| Compliance | `POST /api/auth/age-verification` | Short-lived signed age attestation |
| Products | `GET /api/products` | Category, type, price, search, and sort filters |
| Products | `GET /api/products/:slug` | Active product, images, and variants |
| Checkout | `POST /api/checkout/shipping-quote` | Server shipping calculation |
| Checkout | `POST /api/checkout` | Stock, price, product/variant, age, coupon, and order validation |
| Payments | `POST /api/checkout/stripe/webhook` | Stripe signature-verified payment events |

All checkout totals and unit prices are resolved from Prisma. The client cart is only a list of IDs and quantities. Checkout also requires the `x-age-verification` header, rejects inactive products, rejects mismatched product/variant IDs, and accepts only integer quantities from 1 through 100.

## Frontend Responsibilities

- `AgeGate` blocks storefront entry and obtains the server attestation before storing the local confirmation flag.
- `Header` owns search and category navigation; `MiniCart` is the sliding cart drawer.
- PLP components render filterable product cards and quick variant selection.
- PDP components select variant/flavour/strength, constrain quantity by stock, and add only IDs to Zustand.
- `CheckoutForm` submits customer details and cart IDs; the backend remains authoritative for price, stock, shipping, discounts, and payment state.

## Production Checklist

- Set `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and an explicit storefront origin in deployment secrets.
- Run Prisma migrations and generate the client during deployment.
- Replace local-disk uploads with object storage and add image scanning.
- Add runtime request validation (Zod or Valibot) at every public route.
- Add Stripe event idempotency, payment expiration/inventory release, refund handling, and tax calculation before launch.
- Use secure HTTP-only rotating sessions if browser threat modeling requires stronger protection than bearer tokens.
- Add integration tests for age bypass, variant tampering, stock races, coupon concurrency, and Stripe webhook replay.