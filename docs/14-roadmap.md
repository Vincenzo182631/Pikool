# 14 — Roadmap

Phased delivery. Each phase is shippable and builds on the last. Priorities map
to [`01-product-requirements.md`](./01-product-requirements.md) (P0/P1/P2).

> **Rule:** finish the architecture (04–07) and the P0 slice before breadth. A
> narrow, excellent core beats a wide, half-built app.

## Phase 0 — Foundations (architecture approved first)

Per the brief, do the design work before implementation:
1. Folder architecture (`04`).
2. Database schema + Prisma (`05`).
3. API architecture (`06`).
4. Reusable UI components + design system (`07`).
5. Auth flow (`09`).
6. User flows (`02`, `08`).
7. Implementation plan (this doc).

**Deliverables:** repo scaffold (`apps/web`, `apps/socket`, `packages/db|shared`),
CI, lint/format/test config, Prisma migrations, base UI kit, theming (dark/light),
env + secrets wiring, deploy pipelines to staging.

## Phase 1 — Core play loop (P0) → **MVP**

The end-to-end player journey.
- **Auth & onboarding:** signup, OTP verify, login, reset, social login, profile
  wizard (`09`).
- **Map & courts:** interactive map, layers, court detail, list-view fallback
  (`10`).
- **Check-ins & occupancy:** check-in (incl. QR), live busy level (`10`, `11`).
- **Player card & profiles:** stats, follow/friend (`08`, `12`).
- **Matchmaking:** filters + "I'm Available" + invites (`08`).
- **Messaging:** realtime 1:1 + group chat, presence (`11`).
- **Match recording & rating:** confirmed matches update stats + rating (`12`).
- **Feed:** core post types + interactions (`08`).
- **Notifications:** realtime + list + preferences (`11`).
- **Dashboard & search:** control center + global search (`08`).
- **Admin (core):** users, reports/moderation, court verification, metrics (`13`).

**Exit criteria:** a new user can sign up, onboard, find a court, check in, find a
player, chat, play, and record a result — on mobile and desktop, both themes,
accessible, tested, in production.

## Phase 2 — Community & competition (P1)

- **Clubs:** create/manage, members, club chat, gallery (`08`).
- **Events:** clinics/lessons/open play/leagues, calendar, RSVP/waitlist.
- **Tournaments:** registration, brackets, scoring, results, awards, live
  rankings (`08`).
- **Coaches:** verification, discoverable profiles, listings.
- **Commerce:** store locator + owner management; marketplace (list/browse/chat).
- **Leaderboards & achievements:** global/scoped boards, badges (`12`).

## Phase 3 — Depth & delight (P2)

- **Reputation system** surfaced in matchmaking trust tiers (`12`).
- **Weather** integration + alerts for outdoor play/events (`11`).
- **AI match suggestions** (rules → ML ranking) (`12`).
- **Court/equipment reviews** enrichment, richer analytics.
- **Advanced occupancy** (capacity-aware wait estimates).
- **PWA / installability**, push notifications.

## Phase 4 — Scale & platform (later)

- Native mobile apps (React Native) reusing `packages/shared`.
- Marketplace transactions/checkout (payments) — currently out of scope.
- Public API / partner integrations, court-operator tools.
- Internationalization & localization.
- Read replicas, PostGIS, advanced caching as traffic grows (`04`).

## Sequencing principles

- **Vertical slices:** ship each feature end-to-end (DB → API → UI → tests)
  before starting the next.
- **Realtime after REST:** REST write path first; add socket delivery on top.
- **Verify before broaden:** each phase must be tested and deployed to staging
  before the next begins.
- **Docs stay live:** when a contract changes, update the relevant doc in the same
  PR (`CLAUDE.md` rule).
