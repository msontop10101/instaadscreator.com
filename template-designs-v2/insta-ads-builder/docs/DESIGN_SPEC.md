# Design spec — seller app, admin and templates

Visual source of truth: the design canvas (link in README). Reference HTML for every screen is in `design/` and `templates/`.

## 1. Colour tokens (seller app + admin)

Warm off-white surfaces, near-black ink, one violet accent. Admin uses the same tokens with a dark sidebar/header so it is never mistaken for a seller screen. CSS variables are in `design/tokens.css`.

| Token | Hex | Used for |
| --- | --- | --- |
| `bg` | #F6F5F1 | App background |
| `surface` | #FFFFFF | Cards, sheets, inputs, seller sidebar |
| `surface-muted` | #F0EEE8 | Segmented track, active nav item, table rules |
| `surface-sunken` | #E9E7E0 | Editor canvas background, billing toggle track |
| `border` | #E3E1DA | Card borders, dividers, progress track |
| `border-strong` | #D9D7CF | Input and secondary button borders |
| `border-dashed` | #B9B6AC | Upload slots, "sample data" tag |
| `ink` | #111113 | Main text, dark buttons, admin chrome |
| `ink-2` | #3A3A40 | Body text on white |
| `ink-3` | #5F5F66 | Secondary text, captions, table headers |
| `ink-4` | #57575E | Icons, step labels |
| `accent` | #4A2FE0 | Primary buttons, links, selected states, charts |
| `accent-hover` | #3420B0 | Link hover, text on accent-soft |
| `accent-soft` | #EEEBFF | Selected section row, AI chip |
| `accent-on-dark` | #8B78FF | Spinner on dark Generating screen |

Status pairs (text on its soft background): success #0B6B3A / #DDF5E6 · warning #8A4B00 / #FFF1D6 · danger #A3151B / #FDE7E8 · danger solid white on #C4252B · admin badge #111113 on #FFD60A.

WhatsApp button: background #25D366, text #062B16. **Never white text on this green** (2:1 contrast).
Admin dark chrome: #111113, active item #26262B, text #FFFFFF / #C9C9D0 / #B4B4BC.
Use #C4252B (not #E5484D) for small white-text count badges.

## 2. Typography (seller app + admin)

Space Grotesk 500/600/700 for headings, big numbers, wordmark (letter-spacing -0.02em). Inter 400–700 for everything else.

| Style | Font | Size / line height | Weight | Use |
| --- | --- | --- | --- | --- |
| Display | Space Grotesk | 34–36 / 1.05 | 700 | Desktop titles, revenue |
| H1 | Space Grotesk | 28–32 / 1.1 | 700 | Mobile screen titles |
| H2 | Space Grotesk | 22 / 1.2 | 700 | Card titles on desktop forms |
| Stat | Space Grotesk | 24–32 / 1.1 | 700 | KPI tiles |
| Body L | Inter | 16 / 1.5 | 400–700 | Inputs, primary buttons |
| Body | Inter | 15 / 1.5 | 400–600 | Default text |
| Body S | Inter | 14 / 1.45 | 400–700 | Rows, nav, table cells |
| Caption | Inter | 12–13 / 1.4 | 400–600 | Hints, metadata |
| Badge | Inter | 10–11 | 700 uppercase | PRO, LIVE, REPORTED |

Template fonts and type scales are per template — see `templates/manifest.json`.

## 3. Spacing, radius, layout

- Spacing scale: 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 48. Mobile side padding 20 (admin mobile 16). Desktop main area `clamp(16px, 4vw, 48px)`.
- Radius: sm 6–8 · md 10–12 · lg 14–16 · xl 18–24 · pill 999. Phone preview frame 20–42 with a 5–10 px #111113 border.
- Mobile designed at 390 × 844. Desktop designed at 1440, fluid: 240 px sidebar + content capped at 1100–1160 (Create 1320). Below ~800 px the sidebar wraps above content (`flex-wrap`, sidebar `flex: 1 1 240px`, content `flex: 999 1 560px`). Wide tables scroll inside their card.
- Touch targets ≥ 44 × 44. Main mobile actions 54–58 tall.
- App UI has no shadows or gradients (templates have their own styles).

## 4. Components (`packages/ui`)

| Component | Spec |
| --- | --- |
| Button primary | bg accent, white, 16/700, h 54–56 mobile / 46 desktop, radius 14–16 |
| Button dark | bg ink, white |
| Button secondary | white, 1.5 px border-strong, ink, 14/600, h 44–48 |
| Button danger | solid #C4252B + white, or outline #C4252B + danger text (admin only) |
| Icon button | 44 × 44, radius 12, needs aria-label |
| Input | white, 1.5 px border-strong, radius 12–14, h 46–50, label above 14/600; ₦ prefix; +234 box for phones |
| Radio card | white, 1.5 px border, radius 16–18; selected 2 px accent; selected card expands to show its fields |
| Toggle row | 44 px, label left, checkbox right |
| Segmented control | track surface-muted (#26262B on dark), selected option white 700 |
| Chip / filter pill | h 34–40, radius 999; selected = ink bg + white |
| Badge | 10–11/700 uppercase, padding 3×8 |
| Card | white, radius 16–20, padding 14–22 |
| KPI tile | label 12–13 ink-3, value Space Grotesk 24–32/700, delta 12–13 |
| Bar chart | accent; second series 35% opacity; aria-label with values; real chart lib in code |
| Locked overlay | blur 4–6 px behind, scrim rgba(246,245,241,0.5–0.55), lock + title + one line |
| Bottom nav seller | 4 items (Home, Create, Analytics, Account), 52 px, active accent |
| Bottom nav admin | dark, 5 items, count badge on Moderation |
| Sidebar desktop | 240 px; seller white / admin #111113 |
| Bottom sheet | white, top radius 24, grab handle 40×4 |
| Table | white card, header 12 ink-3, rows 14 with #F0EEE8 rules |
| Phone preview | renders the real template via `packages/templates` |

Icons: Lucide, 24 grid, 2 px stroke, aria-hidden when decorative. No emoji in UI.

## 5. Screens

### Seller (mobile files in `design/seller-mobile`, desktop in `design/seller-desktop`)

| Screen | File | Route | Purpose | Data |
| --- | --- | --- | --- | --- |
| What are you promoting? | PromoType | `/new` | Product / Mobile app / Service or course | — |
| What are you selling? | Create / DeskCreate | `/new/product` | Description, ≤8 photos (first = hero), price, old price, business name. Desktop merges with ordering + live preview | `POST /media` |
| App details | CreateApp | `/new/app` | App name, icon, description, ≤6 screenshots, App Store + Play links, pricing model | `POST /media` |
| How do buyers order? | OrderMethod / DeskCreate | `/new/order` | WhatsApp (number + pre-filled message), call, IG DM, order form, pay online (Pro); buy bar preview | store WhatsApp number, plan |
| Generating | Generating | `/pages/:id/generating` | Dark screen, skeleton phone, 4 steps | `POST /pages` → job; poll or SSE |
| Live | Live | `/pages/:id/live` | Link + copy, edit, how to use in an ad, share WhatsApp / IG bio / QR, expiry banner | URL, expires_at, plan |
| Editor | Editor / DeskEditor | `/pages/:id/edit` | Mobile: preview + sheet (Design, Content, Buy bar). Desktop: sections list · preview · properties + AI chips (Rewrite, More urgent, Pidgin, Shorter) | `GET/PATCH /pages/:id`, `POST /pages/:id/rewrite`, `POST /pages/:id/publish` |
| Home | Home / DeskHome | `/` | Create, Online store (locked, Coming soon), pages list with status/expiry, Pro stats teaser | `GET /stores/:id/pages` |
| Analytics (Pro) | Analytics / DeskAnalytics | `/analytics` | Page picker, range, KPIs, daily chart, sources, funnel, per-page table | `GET /analytics` |
| Upgrade | Upgrade | `/upgrade` | Monthly/yearly, Pro, Free, locked Store plan | `GET /plans`, Paystack |

### Admin (`design/admin`)

| Screen | File | Route | Purpose |
| --- | --- | --- | --- |
| Overview desktop | Admin | `/admin` | Search, range, 5 KPIs, signups vs upgrades, moderation queue, sellers table + filters, upgrade opportunities, AI cost, top templates |
| Overview mobile | AdminMobile | `/admin` | Same data stacked, dark header, bottom nav |
| Review flagged page | AdminMobileReview | `/admin/moderation/:flagId` | Preview, reason, buyer reports, seller facts, Approve / Ask to fix / Take down / Suspend, Skip. Every decision → audit_log + seller notified |

Not yet designed (reuse components): Sellers, Pages, Moderation list, Subscriptions, Domains, AI usage, Templates, Settings & team, seller Account, login (phone OTP), desktop Generating/Live/Upgrade.

## 6. Ad page templates

44 templates in `templates/` with data in `templates/manifest.json`.

- **Product / service (24):** P01–P04 plus 20 niche templates (perfume, aso-ebi, land, cakes, hair oil, power banks, kids wear, shapewear, grooming, home decor, air fryers, jewellery, handbags, online course, makeup artist, solar, car accessories, modest fashion, foodstuff, fitness coaching).
- **App download (20):** one per visual style — glassmorphism, neumorphism, brutalism, bento grid, claymorphism, retro Y2K, Swiss minimal, neon cyber, aurora gradient, editorial serif, skeuomorphic, Material You, iOS clean, Memphis, Japanese zen, 70s groovy, corporate trust, dark luxury, hand-drawn, terminal.

A template = theme (fonts, colours, radius, type scale, card/button CSS for app styles) + ordered sections with variants + CTA type. The AI fills `schemas/page-content.schema.json`; the engine renders it.

Product section library: announce (ink / accent / soft / marquee), header (left / center), hero (stack / fullbleed / poster / centered-arch / collage), trust (row / pills), benefits (checks / numbered / cards / statements), problem, gallery (grid / strip), offer (grid / list / packages / tiers), specs, modules, steps (circles / timeline), proof (quotes / shots / rating / before-after), compare, guarantee, countdown, faq, final (dark / accent / outline), footer, buy bar (flat / pill).

App section library: nav, hero (center / tilt / duo / floating chips / bigtype), strip, features (list / bento / alt / checks), screens, steps, reviews, pricing, faq, final (with QR), footer, download bar.

**Pinned bar rule:** price + action button fixed to the bottom of the viewport at every scroll position on every template; add equal bottom padding. Label/action follow the CTA type:

| CTA | Default label | Action |
| --- | --- | --- |
| whatsapp | Buy on WhatsApp | `https://wa.me/<number>?text=` + message + order code (e.g. Ref LX-4821) |
| call | Call to order | `tel:+234…` |
| dm | DM to order | `https://ig.me/m/<handle>` |
| form | Order now | open/scroll to form (name, phone, address, consent) |
| pay (Pro) | Buy now | Paystack checkout |
| app_download | Get the app | App Store on iOS, Google Play on Android (detect UA); both buttons in hero |

If a variant is picked, the bar shows it ("Size 42 · ₦42,000") and the message includes it. Every tap fires the `buy_tap` beacon first.

Published page budget: < 100 KB HTML+CSS before images, WebP/AVIF at 400/800/1200, fonts self-hosted with `display=swap`, no JS except beacon, variant picker and countdown.

## 7. Behaviour and states

| Feature | Free | Pro |
| --- | --- | --- |
| Pages | 1 on `[brand].ng` | Up to [10] |
| Lifetime | [7] days, then expired | No expiry |
| Order methods | WhatsApp, call, IG DM, app download | + order form, pay online |
| Custom domain, no badge | No | Yes |
| Analytics | Blurred teaser | Full |
| Meta / TikTok pixel | No | Yes |

- Locked features stay visible with a PRO badge or blur; tap → Upgrade. Online store = "Coming soon", inert.
- Expiry warning from 3 days out. Expired page shows buyers "This page is no longer available"; seller gets "Renew with Pro".
- Loading: skeletons, never a full-screen spinner. Generating screen for AI.
- Empty: Home → "Create your first ad page"; Analytics → "No visits yet. Put your link in an ad or your bio."; Admin queue → "Nothing to review".
- Errors: inline 12 px danger under fields; AI failure keeps input + "Try again"; publish failure keeps last live version.

## 8. Accessibility

WCAG 2.2 AA. Every template was checked: body text ≥ 4.5:1, accent-on-button ≥ 4.5:1. Real buttons, links, inputs and labels; aria-label on icon buttons; charts carry a text summary; selection shown by border/fill, not colour alone; 2 px accent focus ring.

## 9. Assets

Fonts from Google Fonts (self-host in production). Icons: lucide-react. All images in the references are labelled placeholders. Sample brands, prices and numbers are examples only.
