# 06 — API Specification

REST API served by **Next.js Route Handlers** under `/api`. All endpoints are
typed, validated with **Zod**, and follow the conventions below. The socket
protocol is separate — see [`11-realtime-features.md`](./11-realtime-features.md).

## Conventions

### Base & versioning
- Base path: `/api`. Breaking changes go under `/api/v2` when needed; v1 is
  implied.
- JSON only. `Content-Type: application/json` unless uploading (see Media).

### Auth
- Send the access token as `Authorization: Bearer <token>` (or via httpOnly
  cookie for browser calls). See [`09-authentication.md`](./09-authentication.md).
- Protected routes return `401` when unauthenticated, `403` when the role/owner
  check fails.

### Response envelope
Success:
```json
{ "ok": true, "data": { }, "meta": { } }
```
Error:
```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [] } }
```
Error codes: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`,
`CONFLICT`, `RATE_LIMITED`, `INTERNAL`.

### Pagination, filtering, sorting (all list endpoints)
- Cursor pagination preferred: `?cursor=<id>&limit=20` (max `limit` 50).
- Offset also supported where cursors don't fit: `?page=1&pageSize=20`.
- Filtering: explicit query params per resource (documented per endpoint).
- Sorting: `?sort=field&order=asc|desc` (whitelisted fields only).
- `meta` returns `{ nextCursor, hasMore, total? }`.

### Rate limiting
Every public route is rate-limited via Redis. Limits returned as headers
(`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`). `429` on exceed.
See `16-security.md`.

### Idempotency
Mutations that can be retried (payments-like, check-in) accept an
`Idempotency-Key` header.

## Endpoint catalog

Notation: `M` = member (authenticated), `O` = resource owner, `A` = admin.
Roles per `02`/`09`.

### Auth — `/api/auth`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/signup` | — | Create account, send OTP |
| POST | `/verify-email` | — | Confirm OTP, activate account |
| POST | `/resend-otp` | — | Resend verification code (rate-limited) |
| POST | `/login` | — | Email/password → tokens |
| POST | `/oauth/:provider` | — | Google/Apple/Facebook exchange |
| POST | `/refresh` | cookie | Rotate refresh → new access token |
| POST | `/logout` | M | Revoke session |
| POST | `/forgot-password` | — | Send reset OTP |
| POST | `/reset-password` | — | Reset with OTP |

### Users & profiles — `/api/users`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/me` | M | Current user + profile + roles |
| PATCH | `/me` | M | Update profile / onboarding |
| GET | `/:username` | — | Public player card |
| GET | `/:username/matches` | — | Recent matches (paged) |
| GET | `/:username/posts` | — | Posts (paged) |
| POST | `/:id/follow` | M | Follow |
| DELETE | `/:id/follow` | M | Unfollow |
| POST | `/:id/friend` | M | Send friend request |
| POST | `/friends/:id/respond` | M | Accept/decline |
| GET | `/search` | — | Search players (filters: skill, city, format) |

### Courts & check-ins — `/api/courts`, `/api/checkins`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/courts` | — | List/search (bbox, radius, filters, sort) |
| GET | `/courts/:id` | — | Detail (photos, occupancy, reviews) |
| POST | `/courts` | O/A | Create court (court owner/admin) |
| PATCH | `/courts/:id` | O/A | Update listing |
| POST | `/courts/:id/reviews` | M | Add review |
| POST | `/courts/:id/save` | M | Save/unsave |
| POST | `/checkins` | M | Check in (body: courtId; QR token optional) |
| DELETE | `/checkins/:id` | O | Check out |
| GET | `/courts/:id/occupancy` | — | Live occupancy snapshot |

Court list filters: `?lat=&lng=&radius=` or `?bbox=minLng,minLat,maxLng,maxLat`,
`?surface=`, `?environment=indoor|outdoor`, `?lighting=true`, `?sort=distance|rating`.

### Matchmaking — `/api/matchmaking`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/players` | M | Nearby players (filters: distance, skill, age, format, casual/competitive) |
| POST | `/available` | M | Broadcast "I'm Available" (format, radius, window) |
| DELETE | `/available/:id` | O | Cancel availability |
| POST | `/invite` | M | Invite a player to a game |
| POST | `/invite/:id/respond` | M | Accept/decline invite |

### Matches — `/api/matches`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/` | M | Record a match (participants, score) |
| POST | `/:id/confirm` | M | Opponent confirms result |
| GET | `/:id` | M | Match detail |

Recording a confirmed match updates participants' stats + rating (`12`).

### Feed & posts — `/api/posts`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/feed` | M | Personalized feed (paged) |
| POST | `/` | M | Create post (type + payload) |
| GET | `/:id` | — | Post detail |
| DELETE | `/:id` | O/A | Delete |
| POST | `/:id/react` | M | Like/unlike |
| POST | `/:id/comments` | M | Comment |
| POST | `/:id/bookmark` | M | Bookmark/unbookmark |
| POST | `/:id/report` | M | Report |

### Messaging — `/api/messages`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/conversations` | M | List conversations |
| POST | `/conversations` | M | Create (direct/group) |
| GET | `/conversations/:id/messages` | M | History (paged) |
| POST | `/conversations/:id/messages` | M | Send (also emits socket event) |
| POST | `/conversations/:id/read` | M | Mark read |

> Realtime delivery is via Socket.io; the REST write is the source of truth (`11`).

### Events — `/api/events`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | — | List (calendar/list; filters: type, date, location) |
| POST | `/` | M | Create event |
| GET | `/:id` | — | Detail |
| POST | `/:id/rsvp` | M | RSVP (going/waitlist) |
| DELETE | `/:id/rsvp` | M | Cancel RSVP |

### Tournaments — `/api/tournaments`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | — | List |
| POST | `/` | O/A | Create (organizer) |
| GET | `/:id` | — | Detail + bracket |
| POST | `/:id/register` | M | Register |
| POST | `/:id/generate-bracket` | O | Seed & generate bracket |
| POST | `/:id/matches/:matchId/score` | O | Enter score, advance |
| GET | `/:id/standings` | — | Live rankings |

### Clubs — `/api/clubs`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | — | List/search |
| POST | `/` | M | Create club |
| GET | `/:slug` | — | Detail (members, events, gallery) |
| POST | `/:id/join` | M | Request to join |
| POST | `/:id/members/:userId/approve` | O | Approve member |

### Store locator & marketplace — `/api/stores`, `/api/marketplace`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/stores` | — | List/search (map + locator) |
| GET | `/stores/:id` | — | Detail (products, hours) |
| POST | `/stores` | O/A | Create store |
| GET | `/marketplace/listings` | — | Browse (filters: category, condition, price, city) |
| POST | `/marketplace/listings` | M | Create listing |
| POST | `/marketplace/listings/:id/save` | M | Save |
| POST | `/marketplace/listings/:id/contact` | M | Open chat with seller |

### Search — `/api/search`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | — | Global search (`?q=&types=players,courts,stores,coaches,events,clubs,equipment`) |

### Notifications — `/api/notifications`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | M | List (paged, unread filter) |
| POST | `/read` | M | Mark read (ids or all) |
| GET | `/settings` / PATCH | M | Per-type preferences |

### Media — `/api/media`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/sign` | M | Return a signed Cloudinary upload payload |

Client uploads directly to Cloudinary using the signed payload, then stores the
returned URL via the relevant resource endpoint. Server never proxies bytes.

### Admin — `/api/admin`
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/metrics` | A | Platform analytics |
| GET | `/reports` | A | Moderation queue |
| POST | `/reports/:id/resolve` | A | Resolve/dismiss |
| GET/PATCH/DELETE | `/users/:id` | A | Manage users |
| POST | `/users/:id/roles` | A | Grant/revoke roles |
| GET/DELETE | `/posts/:id` | A | Moderate content |
| PATCH | `/courts/:id/verify` | A | Verify listing |

## Validation

Zod schemas live in `packages/shared` and are imported by both the route handler
(server validation) and the client (form validation) — one contract, no drift.
Every handler wraps logic in `withValidation(schema, handler)` and
`withAuth(roles)` middleware (`04`).

## Errors & status codes

`200/201` success · `204` no content · `400` validation · `401` unauthenticated ·
`403` forbidden · `404` not found · `409` conflict · `422` semantic ·
`429` rate-limited · `500` internal. Never leak stack traces to clients.
