# Insta Ads Site Creator — Project State & Guide

> Living document. Claude: read this first every session; update it when state changes.
> Owner: Moyosore (msontop.me@gmail.com) · Repo: github.com/msontop10101/instaadscreator.com

## What this is

Free, no-signup, chat-first ad-page builder for Nigerian sellers.
Describe your product like a WhatsApp message → live mobile page at
`<slug>.instaadssitecreator.com` with a WhatsApp buy button. Money comes from
Pro (~₦3,500/mo): analytics, custom domain, no badge, more pages. Pages never
expire. Long-term revenue: Paystack pay-online transaction fees.

## Decisions log (do not re-litigate)

- Domain: **instaadssitecreator.com** (Namecheap; also owns instaadscreator.com — unused)
- Brand display name: **InstaAds** (`app/lib/config.js` — one place)
- Infra: **VPS (Hetzner CX22) + Docker Compose + Caddy + Postgres**; pages publish as **static files** (API down ≠ pages down); visits via in-page beacon
- DNS: **Cloudflare free** (nameservers switched at Namecheap: camilo + raina)
- AI: provider parked; env `AI_BASE_URL/AI_API_KEY/AI_MODEL` (OpenAI-compatible, Groq free tier likely); offline mock powers everything meanwhile
- Free tier: 1 page, badge, forever-live. No expiry anywhere.
- Templates: 60 (40 product w/ manifest section-stacks + 20 app-download). Block engine: themes = tokens + section list; AI chat emits ops, never HTML.
- Working style: discuss before building when asked ("no code updates yet"); browser work = **co-pilot mode** (user clicks, Claude watches screenshots and directs with landmarks)

## Current status (updated 2026-11-22)

**Product: feature-complete prototype, all green (`cd app && npm test`).**
Gallery → use-template → editor (sections add/remove/drag, 60 themes, AI chat,
rewrite chips) → publish → share/Instagram button → analytics. Desktop + mobile.

**Phase A (production foundation): 2/3 done**
- [x] Static publish pipeline + visit beacon
- [x] Docker stack in `deploy/` (app + Caddy wildcard + Postgres) — boots under OrbStack, verified end to end
- [ ] **NEXT UP: Postgres migration** (JSON store → Postgres behind `lib/store.js` interface; all call sites go async; keep tests green)

**Phase B:** security hardening (zod, upload re-encode, rate limits, CSP), CI/CD (Actions: test→build→deploy), backups + Sentry
**Phase C:** anonymous session → WhatsApp-OTP claim at pay moment; enforce 1-page free limit; analytics teaser-gating behind Pro
**Phase D:** Paystack subscriptions (idempotent webhooks); moderation admin + report link + blocklist (**launch-blocking** — scam pages are the #1 domain-reputation risk); support WhatsApp line
**Phase E:** deploy + pilot (xdeals/Ola first, then 10–20 sellers)

## Pending on Moyosore

- [ ] Hetzner account **verification in progress** → then create project `instaads`, server CX22 Ubuntu 24.04 Falkenstein, attach SSH key below, report "server is up, IP is x.x.x.x"
- [ ] Cloudflare: wait for zone **Active** email (nameservers already switched at Namecheap ✅)
- [ ] Cloudflare API token ("Edit zone DNS" template, zone-scoped) → keep in password manager, used on deploy day for wildcard TLS
- SSH public key (private half stays on the Mac at `~/.ssh/instaads`):
  `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINhxesRzx0oPV/CZQX6MgEEpMl/UyLAG/k8CmCHYSYkE instaads-deploy`

## Deploy-day runbook (when server IP exists)

1. Cloudflare DNS: `A @ → IP` and `A * → IP`, both **DNS only** (grey) initially
2. SSH in (`ssh -i ~/.ssh/instaads root@IP`), install Docker, clone repo
3. `deploy/.env`: SITE_DOMAIN, POSTGRES_PASSWORD, CF token (user pastes), AI keys
4. Swap Caddy image for one with the Cloudflare DNS plugin (wildcard cert via DNS challenge) — not yet built, do during deploy
5. `docker compose up -d --build` → smoke test → first page live

## Map

- `app/` product (server.js, lib/, templates/ = block engine + 60 themes, public/ = screens, test/)
- `deploy/` compose + Caddyfile + .env.example (.env gitignored)
- `builder-handoff/`, `template-designs-v2/` design sources (v2 has the full production spec in docs/)
- `xdeals-ads/` original hand-built prototype
- Local dev: `cd app && node server.js` → localhost:4000 · Containers: `cd deploy && docker compose up -d` (OrbStack)
