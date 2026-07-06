# 11 — Realtime Features

Realtime is delivered by a **dedicated Socket.io service** (`apps/socket`),
separate from the Vercel-hosted Next.js app (which can't hold persistent
WebSockets). It shares Postgres (via Prisma) and Redis with the API.

## What is realtime

- **Messaging** — 1:1, group, club, tournament chats; typing; read receipts.
- **Presence** — online/offline, last seen.
- **Court occupancy** — live check-in counts / busy level.
- **Notifications** — messages, friend requests, game invites, check-ins,
  tournament updates, weather alerts.
- **Matchmaking** — nearby "I'm Available" broadcasts and invites.
- **Live tournament** — bracket/score updates.

## Architecture

```
 Client ──WSS──► Socket.io service (apps/socket, always-on)
                     │  ├─ Redis adapter (multi-instance rooms/presence)
                     │  ├─ Prisma (persist / read)
                     │  └─ Redis pub/sub (bridge from REST writes)
 Next.js REST ──write──► Postgres ──publish event──► Redis ──► Socket.io ──► Clients
```

**Single write path.** Mutations always go through the **REST API** (source of
truth → Postgres). The API then **publishes** an event to Redis; the socket
service consumes it and emits to the relevant rooms. Clients never write directly
to sockets for anything that must persist — this avoids divergence and keeps
authorization in one place.

- **Scaling:** `@socket.io/redis-adapter` lets multiple socket instances share
  rooms and broadcasts. Presence lives in Redis so it's consistent across
  instances.
- **Auth:** the socket handshake requires a valid **access token**; the service
  verifies the JWT and attaches `userId` + roles to the socket. Reject on invalid
  / unverified email.

## Rooms

| Room | Membership |
|------|-----------|
| `user:{userId}` | the user's own devices (notifications, invites) |
| `conversation:{id}` | conversation members |
| `court:{id}` | clients viewing a court (occupancy) |
| `club:{id}` | club members |
| `tournament:{id}` | tournament followers/participants |
| `geo:{cellId}` | geohash cell for nearby matchmaking broadcasts |

## Events

Client → Server:
| Event | Payload | Notes |
|-------|---------|-------|
| `conversation:join` | `{ conversationId }` | authz-checked membership |
| `conversation:typing` | `{ conversationId, isTyping }` | ephemeral, not persisted |
| `conversation:read` | `{ conversationId, at }` | also `POST /read` for durability |
| `court:subscribe` | `{ courtId }` | join `court:{id}` |
| `court:unsubscribe` | `{ courtId }` | leave room |
| `presence:ping` | — | keepalive |

Server → Client:
| Event | Payload | Trigger |
|-------|---------|---------|
| `message:new` | `Message` | REST send message |
| `message:read` | `{ conversationId, userId, at }` | read receipt |
| `conversation:typing` | `{ conversationId, userId, isTyping }` | typing |
| `presence:update` | `{ userId, status, lastSeen }` | connect/disconnect |
| `court:occupancy` | `{ courtId, count, busyLevel, skillLevels }` | check-in/out/expiry |
| `notification:new` | `Notification` | any notification created |
| `matchmaking:available` | `{ signal }` | nearby "I'm Available" |
| `invite:new` / `invite:update` | `{ invite }` | game invites |
| `tournament:update` | `{ tournamentId, bracket }` | score entered |

Payloads are validated with shared Zod schemas (`packages/shared`).

## Messaging flow

1. Client `POST /conversations/:id/messages` (REST) → validated, authorized,
   persisted, media already on Cloudinary (signed upload, `06`).
2. API publishes `message:new` to Redis for `conversation:{id}`.
3. Socket service emits `message:new` to members' sockets; offline members get a
   **notification** + unread count and see history on next load.
4. Read receipts: `conversation:read` (socket, live) + `POST /read` (durable).

**Voice notes / location / court invites** are message `kind`s with `meta`;
rendered by `ChatBubble` variants.

## Presence

- On connect, mark `userId` online in Redis (`presence:{userId}` with TTL,
  refreshed by `presence:ping`); on disconnect (or TTL expiry), mark offline and
  emit `presence:update` to interested rooms (conversations, friends).
- `lastSeen` persisted periodically for profile display.

## Occupancy (realtime)

- Check-in/out (REST) updates the Redis occupancy counter and DB, then publishes
  `court:occupancy` to `court:{id}`.
- A scheduled sweeper expires stale check-ins (past `expiresAt`) and emits the
  updated occupancy. See `10`.

## Notifications

- Any server action that should notify a user writes a `Notification` row and
  publishes `notification:new` to `user:{userId}`.
- Client shows a toast + increments the bell badge; the full list is `GET
  /notifications`. Per-type preferences gate delivery.
- **Weather alerts:** a scheduled job checks conditions for users' saved courts /
  upcoming outdoor events and emits alerts.

## Reliability

- **Reconnect:** client uses Socket.io auto-reconnect with backoff; on reconnect
  it refetches missed data via REST (messages since `lastReadAt`, current
  occupancy) — sockets are a delivery optimization, not the only path.
- **Ordering/dedupe:** messages carry server `createdAt` + id; clients dedupe by
  id and order by `createdAt`.
- **Backpressure:** rate-limit socket events per connection; drop/coalesce
  high-frequency ephemeral events (typing, presence pings).
- **Security:** every room join is authorization-checked server-side; never trust
  client-claimed membership. Handshake requires a valid verified session.

## Local dev

- Run `apps/socket` alongside `apps/web`; both point at the same Postgres + a
  local/Upstash Redis. A shared `.env` provides `JWT_ACCESS_SECRET` so the socket
  service can verify tokens minted by the web app.
