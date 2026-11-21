# Insta Ads Creator

AI-powered ad-page builder for Nigerian social-commerce sellers. Describe what
you sell in one message — like chatting with a friend — and get a live,
mobile-first landing page with a WhatsApp buy button, ready to run as an
Instagram/TikTok ad destination. Free to create, free hosting; Pro unlocks
analytics, custom domains and more.

## Repo layout

- **`app/`** — the product: Node/Express builder, 20-theme block engine,
  AI chat editing, template gallery, analytics. See `app/README.md` for
  architecture and how to run.
- **`builder-handoff/`** — the design handoff the builder was built from
  (mobile + desktop screens, ad-page templates, tokens).
- **`xdeals-ads/`** — the original hand-built ad page prototype (Xdeals
  Multiservices) that proved the page formula before the builder existed.

## Quick start

```bash
cd app
npm install
node server.js   # → http://localhost:4000
```

Works fully offline with a built-in mock copywriter. Point `AI_BASE_URL`,
`AI_API_KEY`, `AI_MODEL` at any OpenAI-compatible endpoint to go live.
