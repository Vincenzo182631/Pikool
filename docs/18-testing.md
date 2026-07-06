# 18 — Testing

Quality is part of the Definition of Done (`CLAUDE.md` §5). We test enough to move
fast with confidence — logic and critical flows, not trivia.

## Test pyramid

```
        ▲  E2E (Playwright) — few, critical user journeys
        │  Integration (Vitest) — API handlers + services + DB
        │  Unit (Vitest) — pure logic, rating math, validators, utils
        ▼  Static — TypeScript + ESLint (the widest, cheapest layer)
```

## Tooling

- **Unit / integration:** Vitest.
- **Component:** React Testing Library (+ Vitest).
- **E2E:** Playwright (Chromium preinstalled in the environment).
- **API contract:** Zod schemas from `packages/shared` used in tests to assert
  request/response shapes (contract stays in sync with `06`).
- **Test DB:** ephemeral Postgres (Docker/Neon branch) migrated with Prisma;
  reset between suites.

## What to test

### Unit (fast, many)
- **Rating engine** (`12`): expected score, delta, K-factor decay, clamping,
  doubles averaging, guardrails. Deterministic — pure functions.
- **Validators:** Zod schemas accept valid / reject invalid inputs.
- **Utilities:** distance/geo helpers, formatters, occupancy → busy-level
  bucketing, streak calculations.

### Integration (API + services)
- Each endpoint: happy path + validation errors + **authz** (401/403) +
  not-found + rate-limit behavior (`06`, `16`).
- **Access control is mandatory to test:** user A cannot read/mutate user B's
  resources; role-gated routes reject wrong roles; admin routes require `ADMIN`.
- Stateful flows: signup → OTP verify → login; check-in → occupancy update;
  record match → stats + rating + history + notification (transaction integrity).
- Pagination/filtering/sorting return correct pages and `meta`.

### Component
- Reusable components render states: default, loading (skeleton), empty, error,
  disabled; both **dark and light** themes; keyboard + focus behavior.
- `PlayerCard`, `CourtCard`, `PostCard` variants, `ChatBubble`, form fields.

### E2E (few, high-value) — the P0 journeys
1. **Auth:** sign up → verify OTP → onboard → land in app.
2. **Play loop:** open map → open court → check in → see occupancy update.
3. **Matchmaking + chat:** find player → invite → chat in realtime.
4. **Match + rating:** record match → opponent confirms → stats/rating update.
5. **Feed:** create a post → appears in feed → like/comment.
6. **Admin:** report content → admin resolves.

Run E2E against a preview/staging deploy in CI (`17`).

## Realtime testing

- Integration tests for the socket service: authorized room joins, `message:new`
  delivery, presence transitions, occupancy broadcasts, and **rejection** of
  unauthorized joins (`11`).
- Use two client sockets to assert delivery/read-receipt/typing between users.

## Accessibility testing

- Automated: `axe` checks in component/E2E tests on key screens.
- Manual: keyboard-only pass and screen-reader smoke on core flows before release.
- Assert AA contrast for both themes on primary surfaces (`07`).

## Data & fixtures

- Factory helpers to build users/courts/matches with sane defaults.
- Seed reference data (achievements, skill levels, sample courts) for local + E2E.
- No real PII in fixtures; deterministic seeds for reproducibility.

## Coverage & policy

- Target **meaningful** coverage: high on rating logic, auth, and access control;
  pragmatic elsewhere. Coverage is a signal, not a goal — don't test framework
  code or trivial getters.
- Every bug fix adds a regression test.
- New endpoints ship with integration + authz tests; new rating/stat logic ships
  with unit tests.

## Running

```
pnpm test           # unit + integration (Vitest, watch off in CI)
pnpm test:watch     # local TDD
pnpm test:e2e       # Playwright (needs a running/preview app)
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint + prettier check
```

## CI integration

Typecheck → lint → unit/integration → build → E2E (PR/staging). PRs blocked on
failure (`17`). Flaky tests are quarantined and fixed, never ignored.

## Verify before commit

For non-trivial changes, exercise the affected flow end-to-end (drive the real
app, not just green tests) before committing — see the repo's verify practice
(`CLAUDE.md` §5).
