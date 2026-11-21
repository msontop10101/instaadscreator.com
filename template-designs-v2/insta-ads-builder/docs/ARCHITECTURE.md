# Backend and database architecture

**The one rule:** a buyer opening an ad page never touches the API or the main database. Published pages are pre-built HTML served from the edge; clicks go to a queue. If the API, AI provider or Postgres has a bad hour, every live page keeps selling.

## System map

```text
 Buyers from ads            Seller app               Admin app
      │ pages, clicks            │ seller actions         │ admin actions
      ▼                          ▼                        ▼
 ┌───────────────┐        ┌──────────────────────────────────────┐
 │ Edge          │        │ API (stateless, many copies)         │
 │ Cloudflare    │        │ auth, stores, pages, domains, limits │
 │ KV: host→page │        │ Paystack webhooks, admin endpoints   │
 │ R2: HTML, img │        └──────────────────────────────────────┘
 └───────────────┘           │ jobs            │ reads/writes
   ▲     │ click events      ▼                 ▼
   │     ▼            ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
   │  ┌──────────┐    │ Redis        │  │ Postgres         │  │ Events store │
   │  │ queue    │───▶│ BullMQ, rate │  │ source of truth  │  │ PG partitions│
   │  └──────────┘    │ limits, cache│  │ store_id on rows │  │ → ClickHouse │
   │                  └──────────────┘  └──────────────────┘  └──────────────┘
   │                         │ jobs            ▲ results            ▲ batch inserts
   │                         ▼                 │                    │
   │  publish   ┌─────────────────────────────────────────────────────────┐
   └────────────│ Workers: ai-generate, publish, events-ingest, rollup,    │
                │ moderation, billing, notify, expiry                      │
                └─────────────────────────────────────────────────────────┘
                     │            │              │                 │
                LLM providers  Paystack   WhatsApp Cloud API  Cloudflare for SaaS
```

## Request flows

**Buyer opens a page:** browser → `shop.[brand].ng` or custom domain → edge Worker looks up hostname in KV → returns cached HTML (R2 on miss). No API, no DB. Target < 100 ms TTFB from Lagos.

**Buyer taps the button:** page sends `navigator.sendBeacon('/e', {page, type, source, utm, session_hash})` → edge pushes to queue, returns 204 → buyer goes to WhatsApp / call / DM / form / store. Edge generates the order code (e.g. `LX-4821`) and adds it to the WhatsApp message. Ingest worker batch-inserts every few seconds and updates daily totals.

**Seller generates:** app → API validates, checks plan + rate limit, creates `pages` (status `generating`) + `ai_jobs`, enqueues, replies < 200 ms → AI worker calls LLM with the strict JSON schema, retries with backoff, falls back to a second provider → saves `page_versions` → moderation checks text and price → app polls/SSE.

**Publish:** worker renders with `packages/templates`, inlines critical CSS, uploads to R2, writes KV, purges edge cache, sets `pages.published_version_id`. Rollback = point to previous version.

**Custom domain (Pro):** create `domains` row, register custom hostname with Cloudflare for SaaS, seller adds a CNAME, worker polls verification/SSL.

**Subscription:** Paystack checkout → webhook → verify signature → store raw event in `payment_events` (unique provider_ref, ignore repeats) → billing worker updates subscription, removes expiry, republishes without badge. Failed renewals get a grace period.

## Database (Postgres)

Every table under `stores` carries `store_id`; every query filters by it (plus row-level security). Money in integer kobo.

```text
postgres
├── identity
│   ├── users               id, phone (unique), email, name, created_at
│   ├── otp_codes           phone, code_hash, expires_at, attempts
│   └── sessions            id, user_id, device, expires_at
├── stores                  id, owner_user_id, name, slug (unique), category, city,
│   │                       whatsapp_number, status (active | suspended), created_at
│   ├── store_members       store_id, user_id, role (owner | staff)
│   ├── ad pages
│   │   ├── pages           id, store_id, kind (product | service | app), slug, title,
│   │   │                   status (draft | generating | live | expired | taken_down),
│   │   │                   template_id, cta (jsonb: type, label, number, message, handle,
│   │   │                   app_store_url, play_store_url), price_kobo, old_price_kobo,
│   │   │                   published_version_id, expires_at
│   │   ├── page_versions   id, page_id, content (jsonb, page-content schema),
│   │   │                   source (ai | seller), created_at
│   │   ├── page_variants   id, page_id, label, price_kobo, in_stock
│   │   └── media           id, store_id, page_id, kind (photo | screenshot | icon),
│   │                       r2_key, width, height, bytes
│   ├── domains             id, store_id, hostname (unique), cf_hostname_id,
│   │                       verify_status, ssl_status, checked_at
│   ├── buyers & orders
│   │   ├── order_refs      code (unique), page_id, session_hash, source, utm (jsonb), created_at
│   │   └── form_leads      id, store_id, page_id, order_ref, name, phone_enc, address_enc,
│   │                       consent_at, created_at
│   └── (later) e-commerce  products, product_variants, collections, carts, orders,
│                           order_items, inventory — all keyed by store_id
├── billing
│   ├── plans               id, code (free | pro | store), price_kobo, limits (jsonb)
│   ├── subscriptions       id, store_id, plan_id, status, paystack_code,
│   │                       current_period_end, grace_until
│   ├── invoices            id, subscription_id, amount_kobo, status, paid_at
│   └── payment_events      id, provider_ref (unique), type, payload (jsonb), processed_at
├── templates               id (P01…A20), kind, name, theme (jsonb), sections (jsonb), active
├── ai_jobs                 id, store_id, page_id, status, provider, model, input_tokens,
│                           output_tokens, cost_kobo, error, started_at, finished_at
├── page_stats_daily        page_id, store_id, day, visits, price_views, buy_taps, by_source (jsonb)
├── trust & safety
│   ├── reports             id, page_id, reason, note, reporter_hash, created_at
│   └── moderation_flags    id, page_id, kind (reported | auto | brand), rule,
│                           status (open | approved | fix_requested | taken_down),
│                           decided_by, decided_at
└── platform admin
    ├── admin_users         id, email, role (owner | moderator | support)
    ├── audit_log           id, actor_id, action, target_type, target_id, before, after, created_at
    └── notifications       id, store_id, channel (whatsapp | email | sms), template, status, sent_at
```

Seed the `templates` table from `templates/manifest.json`.

| Index | Serves |
| --- | --- |
| pages (store_id, status) | Seller home |
| pages (status, expires_at) | Expiry job, admin filter |
| page_stats_daily (store_id, day), (page_id, day) | Analytics |
| order_refs code unique | Matching chats to ads |
| moderation_flags (status, created_at) | Queue |
| subscriptions (status, current_period_end) | Renewals |
| ai_jobs (store_id, created_at) | Rate limits, cost |
| payment_events provider_ref unique | Idempotent webhooks |

`form_leads` phone/address are column-encrypted; readable only by the owning store and logged support access.

## Analytics, cache, queues, storage

```text
events      launch: Postgres `events` partitioned by month, 90-day retention → R2 archive
            later: ClickHouse events + materialized daily views
redis       queues (BullMQ), per-store rate limits, 60 s dashboard cache, publish locks
edge        KV hostname→page key · R2 page HTML, photos, backups · image resizing 400/800/1200
```

Event types: `view`, `price_seen`, `buy_tap`, `form_submit`, `variant_pick`, `store_click` (app pages). No names or phone numbers in events — only a hashed session id. Analytics can show counts, sources, device, rough city; it cannot identify who clicked.

## Staying fast and crash-proof

| Risk | Rule |
| --- | --- |
| Viral ad traffic | Static pages at the edge; buyers never reach API/DB |
| Click storms | Queue + batch inserts; beacon returns 204 immediately |
| Slow AI provider | AI only in workers; 60 s timeout, 3 retries, fallback provider |
| One store hogs resources | Per-store rate limits from plan limits; Pro jobs prioritised |
| Connection exhaustion | PgBouncer; per-copy pool limit |
| Heavy admin queries | Read replica + daily totals, never raw events |
| Duplicate payments | Unique provider_ref; idempotent handlers |
| Bad deploy | Pages unaffected; blue-green; additive migrations; one-click rollback |
| Data loss | Managed Postgres with PITR; nightly backups to R2; quarterly restore drill |
| Silent failures | Sentry, OpenTelemetry, alerts on queue depth, failed jobs, p95, 5xx; uptime checks on sample pages |

## Growth stages (starting guesses — load-test to confirm)

| Stage | Sellers | Runs | Move on when |
| --- | --- | --- | --- |
| Launch | up to ~5k | Edge; 1–2 API copies; 1 worker process; managed Postgres + Redis | p95 of inserts or dashboards passes a few hundred ms |
| Growth | ~5k–50k | Read replica; workers split by queue; autoscaled API; ClickHouse for events | Queues back up at peak ad hours |
| Scale | 50k+ | Separate AI worker pool with budget alerts; analytics as its own service | Single primary limits writes |

## Repo layout

```text
repo/
├── apps/        seller/ (Next.js), admin/ (Next.js), marketing/
├── services/    api/, workers/{ai-generate,publish,events-ingest,rollup,moderation,billing,notify,expiry}/, edge/
├── packages/    db/, templates/, page-schema/, queue/, ai/, ui/
└── infra/       IaC, Dockerfiles, CI, alert rules
```

## Open decisions

Node everywhere vs Go for API/ingest · hosting (Railway, Render, Fly.io, AWS) · plan limits · LLM primary/fallback and monthly budget cap · login via WhatsApp OTP, SMS or both · privacy notice, consent text and lead retention under Nigeria's Data Protection Act.
