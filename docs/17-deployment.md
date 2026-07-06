# 17 — Deployment

## Topology

| Component | Host | Notes |
|-----------|------|-------|
| Web (Next.js) | **Vercel** | UI + REST route handlers, serverless/edge |
| Socket service | **Railway** or **Fly.io** | always-on Node (persistent WS) |
| PostgreSQL | **Neon** (or Supabase/RDS) | pooled connections (PgBouncer/Neon pooler) |
| Redis | **Upstash** | rate limit, sessions/OTP, presence, cache, socket adapter |
| Media | **Cloudinary** | images/video/voice, CDN |
| Email | **Resend** | transactional (OTP, resets, notifications) |
| Maps | **Google Maps Platform** | Maps JS (browser), Geocoding/Places (server) |

The web app and socket service share `packages/db` (Prisma) and `packages/shared`
(Zod/types), and connect to the same Postgres + Redis.

## Environments

- **local** — developer machines; local/Upstash Redis, a dev Postgres, test keys.
- **preview** — per-PR Vercel preview + ephemeral/staging DB; auto-deployed.
- **staging** — production-like; used to verify before promotion.
- **production** — protected; deploys from `main` after CI + approval.

Each environment has its **own secrets and API keys**. Never reuse prod keys
elsewhere.

## Environment variables

Documented in `.env.example` (names only). Core set:

```
# Database
DATABASE_URL=
DIRECT_URL=                 # for Prisma migrations (unpooled)

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
AUTH_COOKIE_DOMAIN=

# OAuth
GOOGLE_CLIENT_ID=           GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=            APPLE_TEAM_ID=  APPLE_KEY_ID=  APPLE_PRIVATE_KEY=
FACEBOOK_CLIENT_ID=         FACEBOOK_CLIENT_SECRET=

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=   # referrer + API restricted
GOOGLE_MAPS_SERVER_KEY=                # IP restricted (Geocoding/Places)

# Media
CLOUDINARY_CLOUD_NAME=  CLOUDINARY_API_KEY=  CLOUDINARY_API_SECRET=

# Redis
UPSTASH_REDIS_REST_URL=  UPSTASH_REDIS_REST_TOKEN=

# Email
RESEND_API_KEY=  EMAIL_FROM=

# Realtime
SOCKET_URL=                 # public URL of socket service (client)
NEXT_PUBLIC_SOCKET_URL=

# Misc
WEATHER_API_KEY=
APP_URL=
NODE_ENV=
```

`NEXT_PUBLIC_*` vars are exposed to the browser — only put non-secret values
there (the Maps **browser** key is restricted, never the server key).

## Database migrations

- **Prisma Migrate**. Migrations are committed and reviewed.
- CI runs `prisma migrate deploy` against the target DB during release (using
  `DIRECT_URL`).
- Never edit the DB by hand; never `db push` to production.
- Backups: managed provider automated backups + point-in-time recovery; test
  restores periodically.

## CI/CD (GitHub Actions)

Pipeline stages (see `18` for test detail):

1. **Install** — `pnpm install --frozen-lockfile`.
2. **Typecheck** — `tsc --noEmit`.
3. **Lint** — ESLint + Prettier check.
4. **Unit/integration tests** — Vitest.
5. **Build** — `next build` + build socket service.
6. **E2E (on PR/staging)** — Playwright against a preview deploy.
7. **Migrate + deploy** — on merge to `main`: `prisma migrate deploy`, deploy web
   (Vercel) and socket (Railway/Fly).

Gates: PRs cannot merge without green typecheck, lint, tests, and build. Deploys
to production require the pipeline to pass on `main`.

## Deploy flow

- **Web:** Vercel auto-deploys previews per PR and production on `main`.
- **Socket:** container deploy to Railway/Fly on `main` (or tag); health-checked;
  rolling restart. Multiple instances use the Redis adapter (`11`).
- **Rollback:** Vercel instant rollback to a previous deployment; socket service
  redeploy of the prior image. DB rollbacks via forward-fix migrations
  (avoid destructive down-migrations in prod).

## Observability

- Error monitoring (Sentry) on web + socket, with PII scrubbing (`16`).
- Structured logs shipped to the platform log drain.
- Uptime/health checks: `/api/health` (web) and a socket health endpoint.
- Basic dashboards: error rate, latency, DB connections, Redis usage, Maps quota.

## Scaling & cost

- Vercel scales web functions automatically; keep functions stateless.
- Postgres: connection pooling; add read replicas + PostGIS as map traffic grows
  (`04`, `10`).
- Watch **Google Maps quota** and **Cloudinary** usage; caching + static previews
  keep costs down (`10`).
- Redis TTLs bound memory; alert on quota.

## Pre-launch checklist

- [ ] All env vars set per environment; keys scoped/restricted.
- [ ] Migrations applied; seed reference data (achievements, sample courts).
- [ ] Security headers + CSP verified (`16`).
- [ ] Health checks green; monitoring + alerts wired.
- [ ] Backups + restore tested.
- [ ] E2E of the P0 flow passing on staging (`18`).
