# Souqly — React Frontend

A complete rebuild of the Vanilla JS storefront using React + Vite, built against your
existing ASP.NET Core backend. No backend code was changed.

## Design concept: "The Market Ledger"

Not another Amazon clone. The visual language borrows from an old-world souq's tally
book — brass weights, ink stamps, printed receipts, chalkboard specials — rather than
a generic SaaS/e-commerce template.

- **Color**: espresso-ink (`--ink`), warm stone paper (`--stone`/`--paper`), brass gold
  as the single accent (`--brass`), forest green and brick red for status/secondary use.
- **Type**: Instrument Serif (display, used sparingly for headings), Inter (UI/body),
  Space Mono (prices, quantities, order numbers — the "ledger numerals").
- **Signature elements**: the wax-seal stock stamp on product cards, the chalkboard
  "ledger" category list on the homepage, and the torn-receipt order summary used in
  the cart and checkout.

Full token system lives in `src/styles/tokens.css`.

## Getting started

```bash
npm install
cp .env.example .env   # then edit VITE_API_BASE_URL to point at your backend
npm run dev
```

## ⚠️ Endpoints that need verifying

Most routes were confirmed against your actual controllers during earlier development,
but a few were never wired into a frontend before and are **best guesses** — check
these against your real controllers before relying on them (search each file for `⚠️`):

- `src/api/cart.js` — `removeItem` and `clear` (item delete / clear-cart routes)
- `src/api/products.js` — `getById` and `update` routes
- `src/api/payments.js` — all routes (payment flow was never built into a frontend)
- `src/api/reviews.js` — all routes

Everything else (`auth.js`, `categories.js`, `orders.js`, cart add/update-quantity) was
confirmed against your working backend during earlier debugging sessions.

## Structure

```
src/
  api/         one file per resource, all requests go through client.js
  components/  reusable UI pieces (ProductCard, CartLineItem, states, etc.)
  context/     AuthContext, CartContext, ToastContext
  hooks/       useAsync — the one data-fetching hook everything shares
  layouts/     MainLayout (storefront), AdminLayout (dashboard)
  pages/       one file per route, incl. pages/admin/* for the dashboard
  styles/      tokens.css (design system) + global.css (base/reset/buttons)
  utils/       jwt.js (decode token → user), format.js (money/date)
```

## Roles

- **Customer** — shops normally.
- **Seller** — locked out of Cart/Checkout entirely (server-side enforcement still
  needs the `[Authorize(Roles = "Customer,Admin")]` change on those two backend
  endpoints — the frontend only hides the UI, it doesn't replace real auth).
  Lands on `/dashboard` and can only manage products.
- **Admin** — full dashboard: categories, products, orders (with inline status
  updates), and seller-request approvals. Also always redirected to `/dashboard`.

Customers who get approved as a Seller need to sign out and back in — the JWT they're
holding was issued before the role changed.
