# InstaAds API Reference

Base URL (local): `http://localhost:4000` · All bodies JSON unless noted.
No auth yet (Phase C adds it). Test everything with curl or the browser.

## Meta & account

| Method | Path | What it does |
|---|---|---|
| GET | `/api/meta` | All 60 themes (label, colors, kind: product/app) + block types |
| GET | `/api/me` | User, brand, page domain, Pro price, page limit |
| PATCH | `/api/me` | Update profile: `{name, phone, biz}` |
| POST | `/api/upgrade` | Stub: flips user to Pro, republishes pages badge-free |

```bash
curl -s localhost:4000/api/meta | python3 -m json.tool | head
curl -s -X PATCH localhost:4000/api/me -H 'Content-Type: application/json' -d '{"name":"Tolu"}'
```

## Creating pages

| Method | Path | What it does |
|---|---|---|
| POST | `/api/compose` | Free-text brief → structured fields. Body `{prompt}`. Returns `{fields, missing[]}` |
| POST | `/api/pages` | Create draft. **multipart**: `desc`, `price`, `biz` (required), `oldPrice`, `location`, `template` (locks it), `photos` (≤8 files) |
| POST | `/api/pages/:id/generate` | Writes copy, builds blocks, publishes. Body `{method: whatsapp\|call\|dm, whatsapp}` — async, poll page `status`: draft→generating→live |
| POST | `/api/pages/from-template` | One-click starter from a theme. Body `{template}` → live page immediately |

```bash
curl -s -X POST localhost:4000/api/compose -H 'Content-Type: application/json' \
  -d '{"prompt":"I sell wigs, ₦185,000. Business is Luxe by Tolu, Lekki. WhatsApp 0803 123 4567"}'
curl -s -X POST localhost:4000/api/pages -F desc="22 inch wig" -F price=185000 -F biz="Luxe by Tolu"
curl -s -X POST localhost:4000/api/pages/from-template -H 'Content-Type: application/json' -d '{"template":"noir"}'
```

## Reading & editing pages

| Method | Path | What it does |
|---|---|---|
| GET | `/api/pages` | All pages (with blocks) |
| GET | `/api/pages/:id` | One page |
| PATCH | `/api/pages/:id` | Edit: `{template, blocks[], content{headline,subhead,urgency}, price, oldPrice, buyBarLabel, buttonText, method, whatsapp, appStoreUrl, playStoreUrl, location}` — republishes |
| POST | `/api/pages/:id/rewrite` | AI copy rewrite. Body `{style?: urgent\|pidgin\|shorter, field?}` |
| POST | `/api/pages/:id/chat` | Chat editing. **multipart**: `message`, `images` (≤8). AI emits ops (add/remove/move block, theme, price, hero image…). Returns `{reply, applied[], page}` |
| DELETE | `/api/pages/:id` | Delete + unpublish |

```bash
curl -s -X POST localhost:4000/api/pages/PAGE_ID/chat -F message="remove the FAQ and switch to the volt theme"
```

Block types: announcement, countdown, hero, offer, tiles, benefits, gallery,
variants, howToOrder, reviews, faq, urgency, text, image, specs, compare,
guarantee, modules. Each block: `{id, type, variant?, ...props}`.

## Published pages & tracking

| Method | Path | What it does |
|---|---|---|
| GET | `/s/:slug` | The live page (static file if published; `?preview=1` = render fresh, excluded from stats; `?src=ig\|tiktok\|wa` attributes the visit) |
| GET | `/go/:slug` | Order click → counts + redirects to wa.me/tel/IG. `?store=apple\|google` for app pages |
| POST | `/api/track` | Beacon (also accepts text/plain): `{slug, type: visit\|price_seen\|time, src?, secs?}` |
| GET | `/sample/:theme` | Theme demo page (gallery previews). Overrides: `?desc=&biz=&price=&old=&loc=` |
| GET | `/qr/:slug` | PNG QR code for the page |

## Analytics

| Method | Path | What it does |
|---|---|---|
| GET | `/api/analytics/:id?range=today\|7d\|30d` | Per page, or `:id` = `all` for aggregate. Returns visits, clicks, rate, priceSeen, avgTime, deltas, perDay[], sources[], byPage[] |

```bash
curl -s "localhost:4000/api/analytics/all?range=7d" | python3 -m json.tool
```

## Builder screens (HTML)

`/` home · `/templates` gallery · `/create` · `/order-method` · `/generating` ·
`/live` · `/editor?id=` · `/analytics` · `/account` · `/upgrade`

## Testing

`npm test` — boots a real server on port 4987 with an isolated data dir and
exercises every flow above (test/api.test.js).
