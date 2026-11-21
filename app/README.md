# Insta Ads Site Builder (working name: AdPage)

AI-powered ad-page generator for Nigerian social-commerce sellers.
Seller describes their product → AI writes the copy → page renders into one of
4 battle-tested templates → live on a subdomain with a WhatsApp buy button and
click analytics. Built from the design handoff in `../builder-handoff/`.

## Run

```bash
npm install
node server.js        # → http://localhost:4000
```

## Point it at a real AI model (optional)

Works fully offline with a built-in mock copywriter. To use a real model, set
env vars for any OpenAI-compatible endpoint (Groq / OpenRouter / etc.):

```bash
AI_BASE_URL=https://api.groq.com/openai/v1 \
AI_API_KEY=sk-... \
AI_MODEL=llama-3.3-70b-versatile \
node server.js
```

## Structure

- `server.js` — Express app: builder screens, pages API, generated sites,
  click tracking, analytics, QR codes
- `lib/config.js` — brand name, page domain, page limits, Pro price
  (all `[placeholders]` from the design live here — change once).
  Free pages stay live forever; Pro sells analytics, custom domain,
  badge removal and more pages — there is no expiry.
- `lib/ai.js` — copy generation: live model call + deterministic mock fallback,
  template auto-pick by product category
- `lib/store.js` — JSON-file store (`data/db.json`); swap for Postgres on the VPS
- `templates/` — block engine. A page is an ordered array of blocks
  (announcement, countdown, hero, offer, tiles, benefits, gallery, variants,
  howToOrder, reviews, faq, urgency, text, image); `engine.js` renders any
  block stack through theme tokens; `themes.js` holds the 8 themes
  (Luxe, Soft, Tech, Street, Food, Services, Minimal, Noir — a new theme is
  just a token set). `shared.js` has helpers.
- `lib/chat.js` — chat editing: the AI (or offline keyword parser) emits
  structured ops (add/remove/move block, set theme/price/hero image, rewrite),
  never HTML, so chat can't break a page. Endpoint:
  `POST /api/pages/:id/chat` (multipart: message + images; attached images
  join the page's photo library).
- `public/` — builder screens (responsive, per both handoff sets): home, create,
  order-method, generating, live, editor, analytics, upgrade. Each screen holds
  a `.phone` layout (mobile designs) and a `.desk` layout (Desk* designs);
  CSS switches at 900px and the same JS feeds both. Desktop create combines
  product + ordering on one screen with a live preview; desktop editor is the
  3-column layout (granular section toggles, device toggle, rewrite tone chips);
  desktop analytics adds the all-pages aggregate, combined chart, avg time on
  page and the by-page table.
- `data/uploads/` — seller photos

## Key routes

- `/` builder home · `/create` → `/order-method` → `/generating` → `/live`
- `/editor?id=` template/sections/content/buy-bar editing + AI rewrite
- `/s/:slug` generated page (`?src=ig|tiktok|wa` attributes traffic,
  `?preview=1` excluded from stats)
- `/go/:slug` order-click redirect → wa.me with pre-filled message
- `/api/analytics/:id?range=today|7d|30d` visits, clicks, rate, per-day,
  sources, funnel

## Production path (decided: VPS + Caddy, Nigeria-first)

- Wildcard DNS `*.<domain>` → VPS; Caddy maps Host header → `/s/:slug`
  (route exists; add a small Host-rewrite middleware)
- Swap JSON store for Postgres/SQLite
- Paystack for Pro billing (upgrade endpoint is currently a stub)
- Auth (screens assume a single seller "Tolu" for now)

## Not built yet (deliberately)

Admin screens (handoff designs exist in `../builder-handoff/`), order-form &
pay-online buy methods, Meta/TikTok pixel, custom domains.
