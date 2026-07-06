# 04 — System Architecture

## High-level view

```
                         ┌──────────────────────────┐
                         │        Clients           │
                         │  Web (Next.js, responsive)│
                         └────────────┬─────────────┘
                                      │ HTTPS / WSS
             ┌────────────────────────┼───────────────────────────┐
             │                        │                           │
    ┌────────▼─────────┐    ┌─────────▼──────────┐     ┌──────────▼─────────┐
    │  Next.js (Vercel)│    │ Socket.io service  │     │  Google Maps JS    │
    │  - RSC pages     │    │ (Railway/Fly)      │     │  (client-side)     │
    │  - Route Handlers│    │ - chat/presence    │     └────────────────────┘
    │    (REST API)    │    │ - notifications    │
    └───┬─────────┬────┘    └────────┬───────────┘
        │         │                  │
        │         └───────┬──────────┘
        │                 │
   ┌────▼────┐      ┌──────▼──────┐      ┌───────────┐   ┌──────────┐
   │ Postgres│      │ Redis       │      │Cloudinary │   │ Resend   │
   │ (Neon)  │      │ (Upstash)   │      │ media CDN │   │ email    │
   └─────────┘      └─────────────┘      └───────────┘   └──────────┘
```

- **Next.js app** renders the UI (Server Components + Client Components) and hosts
  the **REST API** via Route Handlers under `/api`.
- **Socket.io service** is a separate always-on Node process for persistent
  realtime (chat, presence, live occupancy, notifications). It shares the Prisma
  client and Redis. See [`11-realtime-features.md`](./11-realtime-features.md).
- **PostgreSQL** is the system of record. **Redis** handles rate limiting,
  sessions/OTP, presence, and caching. **Cloudinary** stores media. **Resend**
  sends transactional email. **Google Maps** runs client-side with server-side
  Geocoding/Places where needed.

## Request lifecycle (REST)

1. Client calls `/api/...` with the access token (Authorization header) or via
   httpOnly cookie for browser calls.
2. **Middleware** resolves auth (JWT verify), attaches `user` + roles.
3. **Rate limiter** (Redis) checks the caller/route budget.
4. **Zod** validates params/body → typed input.
5. **Service layer** runs business logic via Prisma.
6. Response is serialized with a consistent envelope (`06`), errors normalized.

## Layering (inside `apps/web`)

```
src/
├─ app/                       # Next.js App Router
│  ├─ (marketing)/            # public/guest pages
│  ├─ (app)/                  # authenticated app shell
│  │  ├─ map/
│  │  ├─ feed/
│  │  ├─ players/[username]/
│  │  ├─ courts/[id]/
│  │  ├─ matchmaking/
│  │  ├─ messages/
│  │  ├─ events/
│  │  ├─ tournaments/
│  │  ├─ clubs/
│  │  ├─ marketplace/
│  │  ├─ store/
│  │  └─ dashboard/
│  ├─ admin/                  # role-gated admin panel
│  └─ api/                    # REST route handlers (mirrors modules)
│     ├─ auth/
│     ├─ users/
│     ├─ courts/
│     ├─ checkins/
│     ├─ matchmaking/
│     ├─ matches/
│     ├─ posts/
│     ├─ messages/
│     ├─ events/
│     ├─ tournaments/
│     ├─ clubs/
│     ├─ marketplace/
│     ├─ stores/
│     ├─ notifications/
│     └─ admin/
├─ components/                # reusable UI (presentational)
│  ├─ ui/                     # shadcn/ui primitives
│  ├─ map/
│  ├─ player/
│  ├─ feed/
│  ├─ chat/
│  └─ common/
├─ features/                  # feature modules (logic + hooks + local UI)
│  ├─ auth/
│  ├─ courts/
│  ├─ matchmaking/
│  ├─ tournaments/
│  └─ ...
├─ server/                    # server-only code
│  ├─ services/               # business logic per module
│  ├─ repositories/           # Prisma access (thin)
│  ├─ middleware/             # auth, rate-limit, validation wrappers
│  └─ lib/                    # jwt, cloudinary, maps, email, redis clients
├─ lib/                       # isomorphic utilities
├─ hooks/                     # shared React hooks
├─ stores/                    # Zustand stores
└─ styles/                    # Tailwind base + tokens
```

**Rules**
- Components in `components/` are **presentational and reusable** — no data
  fetching, no business logic.
- Data + logic live in `features/` (client) and `server/services` (server).
- `server/` code never imports from `components/`. UI never imports Prisma.
- Everything a feature needs is co-located in its `features/<name>` folder.

## Module pattern

Each domain module is consistent across the app, API, DB, and docs:

```
feature: courts
  ├─ app/(app)/courts/…        # pages
  ├─ app/api/courts/…          # REST handlers
  ├─ features/courts/          # hooks, client logic, local components
  ├─ server/services/courts.ts # business logic
  ├─ packages/db (Court model) # schema (05)
  └─ packages/shared (schemas) # Zod contracts (06)
```

## Data flow for realtime

- Writes (e.g. sending a message, checking in) go through the **REST API** →
  Postgres.
- The API (or the socket service subscribed to Redis pub/sub) **emits** the
  resulting event to connected clients via Socket.io.
- This keeps a single source of truth (Postgres) and one write path, with
  realtime purely as a delivery channel. Full protocol in `11`.

## Caching strategy

- **Map/court reads:** cache hot queries in Redis with short TTL (30–60s);
  invalidate on check-in/occupancy change.
- **Static-ish reads (profiles, listings):** Next.js `revalidate` + Query cache.
- **Presence/occupancy:** Redis counters, source of truth for "live" numbers.

## Scalability notes

- Stateless Next.js functions scale horizontally on Vercel.
- Socket.io scales via the **Redis adapter** (`@socket.io/redis-adapter`) so
  multiple socket instances share rooms/presence.
- Postgres read replicas and connection pooling (PgBouncer / Neon pooler) for
  read-heavy map traffic.
- Media offloaded to Cloudinary CDN; no media through app servers.
