# PicklePlay (`pikool`)

**The Ultimate Pickleball Community** — discover courts, find players, organize
games, track progress, and compete. Built with Next.js 15, TypeScript, Prisma,
PostgreSQL, and TailwindCSS.

> Full product & architecture docs live in [`docs/`](./docs). Start with
> [`CLAUDE.md`](./CLAUDE.md) and [`docs/00-project-overview.md`](./docs/00-project-overview.md).

## Status

Foundation + the **authentication vertical** are built and working end-to-end:

- Next.js 15 App Router scaffold, TypeScript (strict), TailwindCSS v4 design
  system with court-green tokens and **dark/light** themes.
- Full **Prisma schema** (`docs/05`) with an initial migration + seed.
- **Auth**: email/password signup, OTP email verification (required), login,
  session refresh with rotation + reuse detection, logout, password reset —
  JWT access/refresh cookies, rate limiting, Zod validation.
- **Onboarding** → creates the player profile; **player card** page renders live
  data; **dashboard** with real stats; app shell (sidebar, topbar, mobile nav).
- Placeholder surfaces for map, feed, matchmaking, messages, events,
  tournaments, clubs, marketplace — each scoped to its roadmap phase.

Next up (see [`docs/14-roadmap.md`](./docs/14-roadmap.md)): map + courts +
check-ins, matchmaking, realtime messaging, feed, and match recording.

## Prerequisites

- Node 22+, pnpm 10+
- PostgreSQL 14+

## Getting started

```bash
pnpm install
cp .env.example .env.local          # fill in DATABASE_URL + secrets

pnpm db:migrate                     # apply migrations
pnpm db:seed                        # reference data (achievements, sample courts)

pnpm dev                            # http://localhost:3000
```

Without `RESEND_API_KEY`, verification codes are printed to the server console
(dev mode), so you can complete signup locally with no email provider.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Dev server |
| `pnpm build` | Prisma generate + production build |
| `pnpm start` | Start the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` / `db:deploy` | Migrations (dev / prod) |
| `pnpm db:seed` | Seed reference data |
| `pnpm db:studio` | Prisma Studio |

## Tech stack

Next.js 15 · React 19 · TypeScript · TailwindCSS v4 · Prisma · PostgreSQL ·
jose (JWT) · Zod · TanStack Query · next-themes · Framer Motion · lucide-react.
See [`docs/03-tech-stack.md`](./docs/03-tech-stack.md) for the full rationale.

## Notes on this foundation

A few pragmatic, documented deviations from the docs (all easy to evolve):

- **Single Next.js app** for now; the dedicated Socket.io realtime service
  (`docs/11`) is added when realtime lands.
- **Password hashing** uses bcrypt for zero native-build friction; argon2id is
  the documented target and a drop-in swap behind `src/lib/auth/password.ts`.
- **Rate limiting** uses an in-memory store with the same interface as the
  Upstash Redis limiter it will become in production (`src/lib/rate-limit.ts`).
- **Session cookies:** both access (15m) and refresh (30d) are httpOnly cookies
  so SSR route-guards work simply; the client silently refreshes on 401.
