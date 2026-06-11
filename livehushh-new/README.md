# LiveHushh — Full App Source

> "Experience restaurants before you visit"

## What this is

A complete React single-page application for LiveHushh — a platform that connects restaurant diners with restaurants through live video. Built with white + orange branding aligned to the logo.

---

## Quick start (paste into Claude Code)

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start

# 3. Open http://localhost:3000
```

---

## Project structure

```
src/
├── App.js                          # Root with React Router routes
├── index.js                        # Entry point
├── index.css                       # Design tokens + global styles
│
├── context/
│   └── AppContext.js               # Global state: cart, waitlist, orders, user role
│
├── components/
│   ├── UI.js                       # Shared components: Button, Card, AiStrip, etc.
│   └── layouts/
│       ├── CustomerLayout.js       # Bottom nav + top bar for customer app
│       ├── OwnerLayout.js          # Owner dashboard shell
│       └── AdminLayout.js          # Admin dashboard shell
│
└── pages/
    ├── customer/
    │   ├── DiscoverPage.js         # Browse live restaurants, AI picks, filters
    │   ├── LiveViewerPage.js       # Watch live stream, chat, deals
    │   ├── MenuPage.js             # Browse menu, add to cart, live deals
    │   ├── WaitlistPage.js         # Join & track remote waitlist
    │   ├── OrdersPage.js           # Track pre-orders with progress
    │   └── ProfilePage.js          # User profile & settings
    │
    ├── owner/
    │   ├── OwnerStudioPage.js      # Go live, push deals, AI insights
    │   ├── OwnerOrderQueuePage.js  # Manage orders (new → preparing → ready)
    │   ├── OwnerMenuManagerPage.js # Add/edit menu items & deals
    │   └── OwnerAnalyticsPage.js   # Viewers, revenue, top dishes
    │
    └── admin/
        ├── AdminDashboardPage.js   # KPIs, live activity, GMV chart
        └── AdminRestaurantsPage.js # Restaurant table with plan & status
```

---

## Three user types (switchable in top bar)

| Role     | URL prefix  | What they do                                      |
|----------|-------------|---------------------------------------------------|
| Customer | `/`         | Discover → Watch live → Menu → Waitlist → Orders  |
| Owner    | `/owner`    | Studio → Order queue → Menu manager → Analytics   |
| Admin    | `/admin`    | Dashboard → Restaurant management                 |

> **Demo tip**: Use the role switcher dropdown in the top bar to switch between all three user types instantly.

---

## Design system

- **Primary**: `#E85D04` (orange — from logo "hushh")
- **Background**: `#FFFFFF` white with `#FFF7F0` warm cream surfaces
- **Text**: `#1A0800` dark warm black
- **Accents**: `#1D9E75` green (success/wait times), `#FF3B3B` red (live badge)
- **Font**: System sans-serif stack (`-apple-system, BlinkMacSystemFont, Segoe UI`)
- **Radius**: 8px (elements) → 12px (cards) → 16px (panels) → 24px (phone frames)

All tokens defined as CSS variables in `src/index.css`.

---

## AI features (UI implemented, ready to wire to real AI)

| Feature | Screen | Description |
|---------|--------|-------------|
| Smart discovery | Discover | AI strip showing personalised restaurant pick |
| Live wait prediction | Waitlist | Predicted seating time from queue data |
| Menu AI assistant | Menu | Recommends dishes being cooked live |
| Stream summariser | Live viewer | AI recap of what's happened in the stream |
| Deal timing engine | Owner studio | Tells owner when to push deal for max conversion |
| Auto chat replies | Owner studio | AI drafts replies to viewer questions |
| Order batching AI | Order queue | Groups similar orders to save kitchen time |
| Churn risk alerts | Admin dashboard | Flags restaurants with declining engagement |
| Revenue intelligence | Admin dashboard | GMV anomaly detection |

To connect to a real AI backend, replace the static `AiStrip` content in each page with an API call to your AI service. The `AppContext.js` is where you'd add the API hooks.

---

## Connecting to your backend

The app uses mock data in `src/context/AppContext.js`. To connect to your real LiveHushh backend:

1. Replace `RESTAURANTS`, `MENU_ITEMS`, `CHAT_MESSAGES`, `OWNER_ORDERS` with API calls
2. Add authentication (JWT / session) to `AppContext`
3. Wire up the WebSocket for live chat and real-time order updates
4. Connect the live streaming component (replace the placeholder `viewer-box` div with a real HLS/WebRTC player — e.g. `video.js` or `react-player`)

---

## Next steps to make it production-ready

- [ ] Add real authentication (Firebase Auth / Supabase / Auth0)
- [ ] Wire live streaming (HLS/WebRTC — e.g. Agora, Mux, or AWS IVS)
- [ ] Connect WebSocket for real-time chat and order updates
- [ ] Add payment processing (Stripe) to the cart/pre-order flow
- [ ] Add push notifications (Firebase FCM) for waitlist updates
- [ ] Add map integration (Google Maps) for restaurant discovery
- [ ] Replace mock AI strips with Anthropic API calls

---

## Running in Claude Code

Simply open the project folder in Claude Code and say:

> "Install dependencies and start the dev server"

Claude Code will run `npm install && npm start` and open the app at `localhost:3000`.
