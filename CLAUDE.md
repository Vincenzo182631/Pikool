# CLAUDE.md — Master Instruction File

> This is the single source of truth for how Claude (and any developer) should
> work in this repository. Read this file **first**, every session, before
> touching code. When in doubt, this file wins over habit.

---

## 1. What we are building

**Product:** PicklePlay — _The Ultimate Pickleball Community._
**Repo codename:** `pikool`.

PicklePlay is an all-in-one pickleball platform where players **discover courts,
find players, organize games, track progress, buy equipment, join clubs, chat,
and compete in tournaments.** It is a premium, map-centric social + utility app —
**not** a generic social-media clone.

The complete product definition lives in [`docs/`](./docs). Start with
[`docs/00-project-overview.md`](./docs/00-project-overview.md) and read outward.

---

## 2. Document map

| # | Doc | Purpose |
|---|-----|---------|
| — | `CLAUDE.md` | How to work in this repo (this file) |
| 00 | `docs/00-project-overview.md` | Vision, goals, scope, glossary |
| 01 | `docs/01-product-requirements.md` | PRD — features & acceptance criteria |
| 02 | `docs/02-user-stories.md` | User stories per role |
| 03 | `docs/03-tech-stack.md` | Chosen stack + rationale |
| 04 | `docs/04-system-architecture.md` | System & folder architecture |
| 05 | `docs/05-database-schema.md` | Data model + Prisma schema |
| 06 | `docs/06-api-specification.md` | REST API contract |
| 07 | `docs/07-ui-design-system.md` | Design language, tokens, components |
| 08 | `docs/08-pages-features.md` | Page-by-page feature spec |
| 09 | `docs/09-authentication.md` | Auth, sessions, OAuth, OTP |
| 10 | `docs/10-map-system.md` | Google Maps, courts, check-ins |
| 11 | `docs/11-realtime-features.md` | Socket.io: chat, presence, notifications |
| 12 | `docs/12-player-rating.md` | Skill ratings & reputation |
| 13 | `docs/13-admin-dashboard.md` | Admin panel & moderation |
| 14 | `docs/14-roadmap.md` | Phased delivery plan |
| 15 | `docs/15-coding-standards.md` | Conventions & lint rules |
| 16 | `docs/16-security.md` | Security requirements |
| 17 | `docs/17-deployment.md` | Environments & CI/CD |
| 18 | `docs/18-testing.md` | Test strategy |
| 19 | `docs/19-future-ideas.md` | Backlog & moonshots |

---

## 3. Golden rules

1. **Production quality only.** No placeholder UI, no `TODO` stubs shipped, no
   `any` to silence TypeScript. Every screen is responsive and works in **both
   dark and light mode**.
2. **TypeScript everywhere**, `strict` on. Types are documentation.
3. **Modular & reusable.** Every feature is a module; every UI element is a
   reusable component. Do not copy-paste — extract.
4. **Design before code.** For any non-trivial feature: confirm the data model
   (05), the API contract (06), and the component list (07) before implementing.
5. **Secure by default.** Validate every input (Zod), hash passwords (argon2),
   rate-limit every public endpoint, never trust the client. See `16-security.md`.
6. **Follow the schema.** The Prisma schema in `05` is canonical. Migrations are
   reviewed; never hand-edit the database.
7. **Accessibility is a requirement, not a nice-to-have.** Semantic HTML,
   keyboard nav, focus states, ARIA where needed, WCAG AA contrast.

---

## 4. Working conventions

- **Branch:** develop on the assigned feature branch. Never push to `main`/`develop`
  without explicit approval.
- **Commits:** small, descriptive, imperative mood (`add court check-in endpoint`).
- **Path aliases:** import from `@/…`, never deep relative chains.
- **Naming:** components `PascalCase`, hooks `useXxx`, files `kebab-case` for
  routes and `PascalCase.tsx` for components, DB tables/columns per `05`.
- **State:** server state via TanStack Query; ephemeral UI state via Zustand or
  local state. Do not put server data in global stores.
- **Errors:** never swallow. Surface actionable messages; log with context.

---

## 5. Definition of Done

A change is done when it is: typed, validated, tested (unit for logic, e2e for
critical flows), responsive, dark/light correct, accessible, documented if it
changes a contract, and green in CI. See `18-testing.md` and `15-coding-standards.md`.

---

## 6. Brand quick-reference

- **Tone:** premium, athletic, clean, fast — Apple-quality polish.
- **Accent:** pickleball-court green. Full palette in `07-ui-design-system.md`.
- **Feel:** large cards, generous spacing, rounded corners, subtle glassmorphism,
  smooth Framer Motion transitions, professional typography.
