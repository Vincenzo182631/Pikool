# 15 — Coding Standards

Conventions that keep PicklePlay clean, consistent, and reviewable. These are
enforced by ESLint/Prettier/TypeScript where possible; the rest is review policy.

## Language & types

- **TypeScript everywhere**, `"strict": true`. No `any` — use `unknown` +
  narrowing, generics, or precise types. `// @ts-expect-error` only with a reason.
- Prefer **type inference**; annotate public function signatures and module
  boundaries.
- Model closed sets as **enums/unions**, not loose strings.
- Share types via `packages/shared`; derive types from **Zod** schemas
  (`z.infer`) so validation and types never drift.
- No non-null assertions (`!`) to dodge nullability — handle the null.

## Project structure

- Follow the architecture in [`04-system-architecture.md`](./04-system-architecture.md).
- **Presentational components** (`components/`) never fetch data or hold business
  logic. Data/logic lives in `features/` (client) and `server/services` (server).
- UI never imports Prisma; `server/` never imports React components.
- Import via the `@/…` alias — no `../../../` chains.

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Component | `PascalCase` | `PlayerCard.tsx` |
| Hook | `useXxx` | `useCourtOccupancy.ts` |
| Route segment / file | `kebab-case` | `app/(app)/matchmaking/` |
| Server service | `camelCase` fn in `xxx.ts` | `matches.ts` → `recordMatch()` |
| Zod schema | `XxxSchema` | `CreateCourtSchema` |
| Type/Interface | `PascalCase` | `CourtMarker` |
| Constant | `UPPER_SNAKE` | `MAX_CHECKIN_HOURS` |
| DB table/column | per Prisma (`05`) | `MatchParticipant` |
| Boolean | `is/has/can` prefix | `isVerified`, `hasLighting` |

## React & Next.js

- Default to **Server Components**; add `"use client"` only when you need
  interactivity/state/effects.
- **Server state** via TanStack Query; **client/UI state** via Zustand or local
  state. Never store server data in global stores.
- Forms: **React Hook Form + Zod** resolver; validate on the client and re-validate
  on the server (`06`).
- Effects are a last resort — prefer derived state and event handlers. No data
  fetching in `useEffect` when Query fits.
- Keep components small and focused; extract when a file exceeds ~200 lines or
  does two jobs.
- Lists need stable keys (never index). Memoize only measured hot paths.

## Styling

- Tailwind + design tokens (`07`). **No hardcoded hex** in components — use theme
  colors so dark/light both work.
- Compose class strings with `cn()` (clsx + tailwind-merge). No inline styles
  except truly dynamic values.
- Every interactive element: focus ring, disabled + loading states, hover/active.

## API & server code

- Every handler: `withAuth`/`withRole`/`withOwnership` (as needed) +
  `withValidation(schema)` (`04`, `06`).
- Business logic in `server/services`; Prisma access thin in `repositories`.
- Consistent response envelope + error codes (`06`). Never leak internals.
- Use transactions for multi-write invariants (e.g. record match → update stats →
  rating history → notification).
- All list endpoints implement pagination/filtering/sorting (`06`).

## Errors & logging

- Never swallow errors. Throw typed errors; map to HTTP at the boundary.
- Log with structured context (request id, user id, route) — **never** log
  secrets, tokens, passwords, or full PII.
- User-facing messages are actionable and non-technical; details go to logs.

## Async & data

- Prefer `async/await`; handle rejections. No floating promises (lint-enforced).
- Guard against N+1 (use Prisma `include`/`select` deliberately); select only
  needed fields.
- Money in integer cents; time in UTC (`DateTime`), format at the edge; distances
  in meters.

## Comments & docs

- Comment **why**, not what. Match the surrounding density.
- Public/service functions get a one-line doc when non-obvious.
- Update the relevant `docs/*` in the **same PR** when a contract changes.

## Git & PRs

- Branch off the assigned feature branch; never push to protected branches without
  approval.
- Small, focused commits; imperative subject (`add court check-in endpoint`).
- PRs: clear description, linked story/doc, screenshots for UI, checklist of the
  Definition of Done (`CLAUDE.md` §5).
- Green CI required: typecheck, lint, tests, build (`17`, `18`).

## Tooling config (baseline)

- ESLint: `next/core-web-vitals`, `@typescript-eslint` (with
  `no-floating-promises`, `no-explicit-any`), `eslint-plugin-tailwindcss`.
- Prettier + `prettier-plugin-tailwindcss` (class sorting).
- Husky + lint-staged: on commit run typecheck (changed), eslint --fix, prettier,
  and related unit tests.
- `tsconfig`: `strict`, `noUncheckedIndexedAccess`, `paths` for `@/…`.

## Accessibility & performance (non-negotiable)

- WCAG AA, keyboard paths, semantic HTML, `alt` text, labeled controls (`07`).
- `next/image` for all images; lazy-load heavy/below-the-fold; code-split routes
  (Maps JS only on map routes).
- Avoid layout shift (reserved sizes, `next/font`). Respect
  `prefers-reduced-motion`.
