# Insta Ads Site Builder — build package

An AI-powered ad landing page builder for Nigerian sellers. A seller says what they are promoting (a product, a mobile app, or a service), and in under a minute gets a live, mobile-first, direct-response page on a subdomain, with a pinned buy/download button. Revenue comes from Pro: pages stay live, custom domain, no badge, analytics.

**Coding agent: start with `BUILD_GUIDE.md`.**

## What is in here

```text
insta-ads-builder/
├── README.md                 this file
├── BUILD_GUIDE.md            step-by-step build plan for the coding agent
├── docs/
│   ├── DESIGN_SPEC.md        colours, type, spacing, components, every screen, states, accessibility
│   └── ARCHITECTURE.md       backend, database tree, request flows, scaling rules, repo layout
├── schemas/
│   └── page-content.schema.json   the JSON the AI must output and the templates render
├── design/
│   ├── tokens.css            app tokens (seller app + admin)
│   ├── seller-mobile/        10 phone screens (390 px)
│   ├── seller-desktop/       4 fluid desktop screens (designed at 1440)
│   └── admin/                desktop overview, mobile overview, mobile moderation review
├── templates/
│   ├── manifest.json         every template: fonts, colours, type scale, section order, CTA type
│   ├── product/              24 product / service ad page templates (P01–P04 + Tpl*)
│   └── app/                  20 app download templates, one per visual style (App*)
└── reference/
    └── template-generators/  the Python that generated the templates (shows how sections and themes combine)
```

Every `.html` file opens directly in a browser. Styles are inline exactly as designed; links between screens work. They are **visual references, not production code**.

## Live sources

- Design canvas (source of truth for visuals): https://claude.ai/artifact/Hk7vYk3Xj2rWoyXKs3QUyx — pages: Builder & admin · Template library · App templates
- Developer handoff doc: https://claude.ai/artifact/Bs3geSWicwnceZJC9TZSLk
- Backend & database doc: https://claude.ai/artifact/GaiqRzDZao1vaPFCrzwyeE

## Placeholders still to decide

`[Brand]` (product name and `[brand].ng` domain), Pro price `₦[PRICE]`, free page lifetime `[7] days`, Pro page limit `[10]`. Anything in `[square brackets]` on a template (ratings, review text, registration numbers, licence details) must come from the seller, never from the AI. Image areas are labelled placeholders; analytics and admin numbers are sample data.
