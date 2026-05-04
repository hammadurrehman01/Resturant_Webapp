# Restaurant Smart System — Public Web App

Customer-facing site for browsing the menu, placing orders, tracking delivery, and chatting with the assistant in English, Roman Urdu, or Urdu.

## Stack
- React 18 + Vite 5
- React Router v6
- Tailwind CSS 3
- Zustand (cart + UI state, persisted)
- Axios

## Quick start

```bash
cp .env.example .env       # default values point to localhost backend
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api/*` to the backend (default `http://localhost:4000`), so the frontend can run without configuring CORS while you iterate. For production, set `VITE_API_BASE_URL` to your backend's public origin.

Make sure the backend is running and seeded:
```bash
cd ../backend && npm run seed && npm run dev
```

## Pages
| Route | Description |
|---|---|
| `/` | Hero, featured items, value props |
| `/menu` | Searchable menu grouped by category, with category pills |
| `/order` | Cart + checkout form (name, phone, address, payment); shows success state with track link |
| `/track` and `/track/:orderNumber` | Lookup an order by number + phone with a status timeline |
| `/about` | Description, hours (sorted Mon → Sun), address, contact |
| `/contact` | Contact info + chat shortcut |

## Persistent UI
- **Cart** (drawer + count badge) — Zustand store persisted to `localStorage` under `rss-cart-v1`. Survives refresh.
- **Chat widget** (floating bubble bottom-right) — Locale toggle (`auto / EN / Roman / اردو`); the input flips to RTL with Nastaliq when Urdu is selected. Session ID and transcript are persisted under `rss-chat-session-v1` so a multi-turn order flow ("1 biryani aur 1 coke" → name → phone → address → confirm) survives navigation.

## Architecture

```
src/
├── api/              axios client (unwraps {success,data,meta} envelope) + endpoints
├── components/
│   ├── layout/       Layout, Header (cart badge, nav), Footer
│   ├── menu/         MenuItemCard
│   ├── cart/         CartDrawer (slide-in)
│   ├── chatbot/      ChatWidget (floating bubble + RTL panel)
│   └── ui/           Spinner, Empty
├── hooks/            useRestaurant (with module-level cache), useMenu
├── pages/            HomePage, AboutPage, MenuPage, OrderPage, TrackOrderPage, ContactPage, NotFoundPage
├── store/            cart.js (persisted), ui.js (drawer/chat flags)
├── lib/              format helpers (money, status badge classes)
├── App.jsx           Routes
└── main.jsx          Entry + BrowserRouter
```

**Why a module-level cache for `useRestaurant`** — the restaurant profile is read on almost every page (header, footer, menu, about, order). Caching at the module level avoids one HTTP round-trip per navigation without bringing in TanStack Query.

**Why no global form library** — the only real form is checkout. Native HTML validation + a small `useState` is faster to read than a Formik/RHF setup for one page.

**Why localStorage for chat session** — the session is the linchpin of the multi-turn order flow on the backend. If a user refreshes mid-flow (after giving phone but before address), we'd lose the in-progress cart on the server unless the same `sessionId` is sent next time. Persisting it client-side keeps the flow resumable without auth.

## Configuration

`.env` keys:
- `VITE_API_BASE_URL` — leave blank in dev (Vite proxy handles `/api`); set to backend origin in prod.
- `VITE_API_PREFIX` — default `/api/v1`.
- `VITE_API_PROXY_TARGET` — backend origin for the dev proxy.
- `VITE_RESTAURANT_SLUG` — which restaurant this storefront represents. Single-tenant today; switch to URL/subdomain when multi-tenant SaaS arrives.

## Build

```bash
npm run build       # outputs to ./dist
npm run preview     # preview production build on :4173
```

The `dist/` folder is a static SPA — deploy to any static host (Cloudflare Pages, Netlify, S3+CloudFront, nginx). Configure your host to fall back to `index.html` for unknown paths so client-side routes resolve.
