# Deploy

1. Copy `.env.example` to `.env` and fill it in.
2. `docker compose up -d --build`
3. Point DNS: A record for `yourdomain` and `*.yourdomain` to the VPS IP.
   Caddy issues TLS automatically (wildcard needs a DNS challenge or
   on-demand TLS — configure when the real domain lands).

Env vars: SITE_DOMAIN, POSTGRES_PASSWORD, AI_BASE_URL/AI_API_KEY/AI_MODEL.
