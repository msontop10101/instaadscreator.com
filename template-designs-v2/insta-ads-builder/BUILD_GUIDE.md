# Build guide (for the coding agent)

Read `docs/DESIGN_SPEC.md` and `docs/ARCHITECTURE.md` before writing code. Open the HTML files in `design/` and `templates/` to see each screen. Match them visually; rebuild them as components with tokens rather than copying inline styles.

## Stack

- TypeScript monorepo: pnpm + Turborepo.
- `apps/seller` and `apps/admin`: Next.js (App Router), React, Tailwind or CSS variables from `design/tokens.css`, `lucide-react` icons.
- `services/api`: Fastify (or NestJS), zod validation, Drizzle ORM on Postgres.
- `services/workers`: BullMQ on Redis (queues: ai-generate, publish, events-ingest, rollup, moderation, billing, notify, expiry).
- `services/edge`: Cloudflare Worker + KV + R2 that serves published pages by hostname and receives the analytics beacon at `/e`.
- `packages/templates`: pure functions `render(content, templateId) → HTML string`, used by both the editor preview and the publish worker.
- `packages/page-schema`: zod version of `schemas/page-content.schema.json`, shared by the AI worker, API and editor.
- Payments: Paystack. Messaging: WhatsApp Cloud API. Custom domains: Cloudflare for SaaS.

## Milestones

Build in this order. Each milestone ends with something runnable.

1. **Foundations.** Monorepo, tokens, base UI components (DESIGN_SPEC → Components), Postgres schema and migrations (ARCHITECTURE → Database), phone-OTP auth stub.
2. **Template engine.** Implement `packages/templates` with the section library and all 44 templates from `templates/manifest.json`. Each template = theme tokens + ordered section list + CTA type. Render a sample `page-content` JSON for every template and compare against the reference HTML side by side.
   - Product templates use the pinned **buy bar** (order methods: whatsapp, call, dm, form, pay).
   - App templates use the pinned **download bar** and App Store / Google Play buttons. Use the official store badges in production.
   - The bar is `position: fixed; bottom: 0` on every template, with matching bottom padding on the page.
3. **Seller create flow (mobile first).** PromoType → Create (product/service) or CreateApp (app) → OrderMethod (products only) → Generating → Live. AI worker returns JSON validated against the schema; on failure keep the seller's input and offer retry.
4. **Publish + edge.** Publish worker renders HTML, uploads to R2, writes `hostname → key` in KV. Edge Worker serves pages with no API or DB calls. Subdomains `*.[brand].ng`.
5. **Editor.** Mobile bottom-sheet editor and desktop three-panel editor: template switch, section toggles and reorder, inline text edit, AI rewrite chips, buy bar settings. Preview uses the same `render()`.
6. **Home, plans and billing.** Seller home, Upgrade, Paystack subscriptions with idempotent webhooks, free-page expiry job, badge removal on Pro, custom domains.
7. **Analytics.** Beacon events (`view`, `price_seen`, `buy_tap`, `form_submit`, `variant_pick`), order codes in WhatsApp messages, batch ingest, daily roll-ups, seller analytics screens (Pro-gated).
8. **Admin.** Overview (desktop + mobile), moderation queue and review screen, audit log on every decision, seller search and filters.
9. **Desktop seller layouts.** DeskHome, DeskCreate (with live preview), DeskEditor, DeskAnalytics.
10. **Hardening.** Rate limits per store, timeouts on all external calls, Sentry + OpenTelemetry, alerts on queue depth, load test of the edge page path and beacon.

## Acceptance checks

- A published page loads with no request to the API or Postgres (verify in the edge Worker logs).
- Every template passes WCAG AA contrast and has ≥44 px tap targets; the pinned bar never covers content.
- The WhatsApp button uses `#25D366` with `#062B16` text (never white text).
- Webhooks can be replayed without double-upgrading a store.
- Killing the API or the AI provider does not take any live page down.
- Money is stored as integer kobo; every store-owned row has `store_id`.

## Out of scope for now

The online store (e-commerce) builder: show it as "Coming soon" where designed. Keep the data model ready for it (see ARCHITECTURE).
