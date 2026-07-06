# 03 — Tech Stack

The stack below is the recommended, decided stack. It follows the product brief
and resolves its open choices with rationale. Versions are targets at time of
writing; keep them current but do not churn majors without a reason.

## Summary

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 15** (App Router, React Server Components) |
| UI runtime | **React 19** |
| Language | **TypeScript** (`strict`) |
| Styling | **TailwindCSS** + **shadcn/ui** (Radix primitives) |
| Animation | **Framer Motion** |
| Server API | **Next.js Route Handlers** (REST) |
| Realtime | **Socket.io** (dedicated Node service) |
| Database | **PostgreSQL** |
| ORM | **Prisma** |
| Auth | **JWT** (access + refresh), **OTP** email verify, OAuth |
| Storage | **Cloudinary** |
| Maps | **Google Maps Platform** (Maps JS, Places, Geocoding) |
| Cache / rate-limit | **Redis** (Upstash) |
| Email | **Resend** (transactional) |
| Validation | **Zod** (shared client/server) |
| Server state | **TanStack Query** |
| Client state | **Zustand** |
| Forms | **React Hook Form** + Zod resolver |
| Testing | **Vitest**, **React Testing Library**, **Playwright** |
| Deployment | **Vercel** (web) + **Railway/Fly** (socket) + **Neon** (db) |

## Key decisions & rationale

### Next.js API Routes vs. Node + Express
**Decision: Next.js Route Handlers** for the REST API. One codebase, one deploy
target (Vercel), shared types and Zod schemas between client and server, and
first-class edge/serverless support. Express would add an extra service and
deployment surface for no benefit at our scale.

> **Exception — realtime.** Vercel serverless functions are not suited to
> persistent WebSocket connections. Socket.io therefore runs as a **separate,
> always-on Node service** (Railway or Fly.io) that shares the Prisma client and
> talks to the same Postgres + Redis. See `04` and `11`.

### Why Prisma + PostgreSQL
Relational data (players, courts, matches, clubs, tournaments) with many
relationships → normalized SQL. Prisma gives typed queries, migrations, and a
schema that doubles as documentation (`05`). PostgreSQL adds PostGIS-style geo
querying (via `earthdistance`/`cube` or PostGIS) for "courts near me".

### Why JWT + OTP
Brief mandates JWT and OTP email verification. We issue a short-lived **access
token** (15 min) and a rotating **refresh token** (httpOnly, secure cookie).
OAuth (Google/Apple/Facebook) federates identity; all accounts still require a
verified email. Details in `09`.

### Why Redis
Rate limiting, OTP/session storage, presence/occupancy counters, and caching hot
map queries. Upstash gives serverless-friendly Redis over HTTP.

### Why Cloudinary
Handles image/video upload, transformation, and CDN delivery (profile/cover
photos, court photos, post media, voice notes) without us running media infra.

## Frontend libraries

- **Maps:** `@vis.gl/react-google-maps` wrapper over Google Maps JS.
- **Data fetching:** TanStack Query with typed API client generated from Zod.
- **Icons:** `lucide-react`.
- **Dates:** `date-fns`.
- **Charts (stats/admin):** `recharts` (theme-aware — see dataviz guidance).
- **Toasts:** `sonner`.

## Tooling

- **Package manager:** `pnpm`.
- **Monorepo?** Single Next.js app + a small `socket-server` package. Use a
  `pnpm` workspace so both share `@pikool/db` (Prisma client) and `@pikool/shared`
  (Zod schemas, types).
- **Lint/format:** ESLint (typescript-eslint) + Prettier + Tailwind plugin.
- **Git hooks:** Husky + lint-staged (typecheck + lint + test on staged).
- **CI:** GitHub Actions (see `17`).

## Suggested workspace layout

```
pikool/
├─ apps/
│  ├─ web/            # Next.js app (UI + REST route handlers)
│  └─ socket/         # Socket.io realtime service
├─ packages/
│  ├─ db/             # Prisma schema + generated client
│  ├─ shared/         # Zod schemas, shared types, constants
│  └─ ui/             # shared shadcn/ui component library (optional)
├─ docs/
└─ CLAUDE.md
```

The concrete internal folder architecture is in
[`04-system-architecture.md`](./04-system-architecture.md).

## Environment variables (overview)

See `17-deployment.md` for the full list. Core groups: database (`DATABASE_URL`),
auth (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`), OAuth client IDs/secrets,
Cloudinary keys, Google Maps key(s), Redis (Upstash) URL/token, Resend key,
weather API key. **Never** commit secrets; use `.env.local` and platform secret
managers.
