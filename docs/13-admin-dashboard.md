# 13 — Admin Dashboard

The admin panel keeps PicklePlay safe, high-quality, and growing. Routes under
`/admin/**`, gated to the `ADMIN` role (`09`). Every mutating action is audited.

## Access & safety

- `ADMIN` role required; Next.js middleware + `withRole('ADMIN')` on every admin
  API (`06`, `09`).
- **Audit log:** all admin mutations record `{ adminId, action, targetType,
  targetId, before, after, at }`. Immutable, reviewable.
- Destructive actions require confirmation; reversible where possible
  (soft-delete, restore).
- Principle of least privilege: consider sub-admin scopes (moderator vs.
  super-admin) in v2.

## Sections

### 1. Dashboard (overview)
At-a-glance platform health: active users (DAU/WAU/MAU), new signups, games
recorded, check-ins today, open reports, revenue-adjacent activity (listings,
event RSVPs). Theme-aware charts (see dataviz guidance).

### 2. Users
- Search/filter users; view profile, roles, sessions, activity.
- Actions: grant/revoke **roles**, verify coaches/owners/organizers, suspend/ban,
  force password reset, delete (soft), impersonate for support (audited, v2).
- Handle role **applications** (coach/court/store/tournament verification).

### 3. Posts / Content
- Browse and moderate feed posts + comments.
- Remove content (soft-delete), restore, and see report context.

### 4. Courts
- CRUD court listings; **verify** user-submitted (pending) courts.
- Merge duplicates; fix geocoding; manage photos and amenities.

### 5. Stores
- CRUD store listings and products; verify ownership claims.

### 6. Tournaments
- Oversee tournaments; assist organizers; intervene on disputes; void invalid
  results.

### 7. Reports (moderation queue)
- Queue of `Report` rows (posts, comments, users, listings, reviews) with status
  `OPEN → REVIEWING → RESOLVED/DISMISSED`.
- Triage by severity/recency; take action (remove content, warn/suspend user) and
  record resolution + reason.
- SLA target: reports actioned < 24h.

### 8. Analytics
- Growth (signups, activation, retention cohorts).
- Engagement (games/week, check-ins, messages, feed activity).
- Liquidity (courts with daily activity, matchmaking fulfillment).
- Commerce (listings created, contacts, store views).
- Geographic distribution and top courts/clubs.
- Export CSV; date-range and segment filters.

### 9. Moderation tools
- Word/phrase blocklists, spam heuristics, rate-limit overrides.
- Bulk actions on flagged content; appeal handling (v2).
- Weather/notification job status and manual triggers.

## Admin APIs

See [`06-api-specification.md`](./06-api-specification.md#admin----apiadmin):
`/admin/metrics`, `/admin/reports`, `/admin/users/:id`, `/admin/users/:id/roles`,
`/admin/posts/:id`, `/admin/courts/:id/verify`, etc. All require `ADMIN` and write
to the audit log.

## UX

- Dense but clean data tables (sortable, filterable, paginated) using the shared
  design system (`07`); both themes.
- Detail drawers for entities; inline actions with confirmation.
- Clear empty/loading/error states; optimistic updates only where safe.
- Keyboard-friendly tables and forms (accessibility, `07`).

## Metrics data sourcing

- Prefer pre-aggregated queries / materialized views for heavy analytics to keep
  the panel fast; cache in Redis with sensible TTLs.
- Never run unbounded scans on hot paths; paginate everything.
