# 08 — Pages & Features

Page-by-page spec. Each entry: route, purpose, key components, data sources, and
states. Components reference [`07-ui-design-system.md`](./07-ui-design-system.md);
APIs reference [`06-api-specification.md`](./06-api-specification.md).

## Navigation model

- **Desktop:** left rail (Map, Feed, Matchmaking, Messages, Events, Tournaments,
  Clubs, Marketplace, Dashboard) + top bar (global search, notifications bell,
  avatar menu). **Mobile:** bottom tab bar (Map, Feed, Play, Messages, Profile)
  with the rest under a menu.
- **Guest** sees Map, Feed (public), and marketing pages; actions prompt sign-up.

---

## Public / Auth

### `/` — Landing (guest)
Premium marketing page: hero (tagline "The Ultimate Pickleball Community"),
feature highlights, live stats, CTA to sign up. Responsive, both themes.

### `/login`, `/signup`, `/verify`, `/forgot`, `/reset`
Auth flows. Components: `AuthCard`, `OtpInput`, social buttons (Google/Apple/
Facebook), terms checkbox, "remember me". See [`09-authentication.md`](./09-authentication.md).

### `/onboarding`
Multi-step, resumable wizard collecting profile (name, username, photo, city,
country, skill level, dominant hand, playing style, years playing, favorite
paddle, availability, formats). Progress saved per step (`PATCH /users/me`).

---

## Core app

### `/map` — Map (P0, flagship)
Interactive Google Map with layered markers and filters. Floating court cards
(desktop) / bottom sheet (mobile). Full spec: [`10-map-system.md`](./10-map-system.md).
- Components: `MapCanvas`, `MapFilterBar`, `MarkerCluster`, `CourtCard`,
  `BusyLevelMeter`, `LocationSearch`.
- Data: `GET /courts` (bbox), `GET /stores`, coaches/clubs/tournaments/POIs.
- States: locating, empty (no courts in view), error, loading clusters.

### `/courts/[id]` — Court detail (P0)
Photos gallery, rating + reviews, surface, indoor/outdoor, lighting, open-play
schedule, **live busy level & current check-ins (realtime)**, amenities,
directions (deep-link), save. Check-in / QR check-in button.
- Data: `GET /courts/:id`, `GET /courts/:id/occupancy`, socket `court:occupancy`.
- Actions: `POST /checkins`, `POST /courts/:id/reviews`, `POST /courts/:id/save`.

### `/feed` — Home feed (P0)
Personalized pickleball feed. Composer supports all post types (game invite,
match result, court/paddle review, training tip, tournament news, photo, video,
poll). `PostCard` variants; actions like/comment/share/bookmark/report.
- Data: `GET /posts/feed` (infinite scroll); `POST /posts`.
- States: empty (follow suggestions), loading skeletons, new-items pill.

### `/players/[username]` — Player profile / card (P0)
Pro-style **player card** (not a social wall): profile + cover photo, name,
username, `RatingBadge`, `StatTile` row (games, wins, losses, win %, current +
longest streak), years playing, favorite paddle, dominant hand, home court,
achievements, badges, followers/following/friends, recent matches, photos,
videos, posts. Follow / friend / message actions.
- Data: `GET /users/:username`, `/matches`, `/posts`.

### `/matchmaking` — Find players (P0)
Filters: distance, skill, age, availability, singles/doubles,
competitive/casual. Prominent **"I'm Available"** button (format + time window).
Nearby-player list with quick invite. Notifications on new nearby availability.
- Data: `GET /matchmaking/players`; `POST /matchmaking/available`,
  `POST /matchmaking/invite`.

### `/messages` — Messaging (P0)
Realtime chat: conversation list + thread. 1:1, group, club, tournament chats.
Send images, location, court invites, voice notes. Typing indicators, read
receipts, presence. Full protocol: [`11-realtime-features.md`](./11-realtime-features.md).
- Components: `ConversationList`, `ChatThread`, `ChatComposer`, `ChatBubble`,
  `PresenceDot`, `TypingIndicator`.
- Data: `GET /conversations`, `/conversations/:id/messages`; socket events.

### `/events` — Events (P0/P1)
List + calendar views. Types: clinics, lessons, open play, leagues, social
games, tournaments. RSVP, capacity, waitlist. `EventCard`, `CalendarView`.
- Data: `GET /events`; `POST /events`, `POST /events/:id/rsvp`.

### `/tournaments` + `/tournaments/[id]` (P1)
Listings, registration, `BracketView`, score tracking, results, awards, live
rankings. Organizer tools gated by role.
- Data: `GET /tournaments`, `/:id`; `POST /:id/register`,
  `/:id/generate-bracket`, `/:id/matches/:mid/score`.

### `/clubs` + `/clubs/[slug]` (P1)
Club directory + club page (members, events, posts, gallery, realtime chat).
Join requests + approvals; member roles (owner/admin/member).
- Data: `GET /clubs`, `/:slug`; `POST /:id/join`, member approve.

### `/marketplace` + `/marketplace/[id]` (P1)
Buy/sell used equipment. Browse with filters (category, condition, price, city).
Listing: condition, photos, price, **chat seller**, save, report.
- Data: `GET /marketplace/listings`, `POST /marketplace/listings`,
  `/:id/contact` (opens chat), `/:id/save`.

### `/store` + `/store/[id]` — Store locator (P1)
Stores selling paddles/balls/shoes/grips/bags/apparel/accessories. Store page:
photos, products, directions, hours, website, phone. Also surfaced on the map.
- Data: `GET /stores`, `/stores/:id`.

### `/dashboard` — Player dashboard (P0)
Control center: upcoming matches, messages, notifications, achievements,
statistics, saved courts/stores/players, favorite equipment, settings, privacy.
Widget grid; each links to source.
- Data: aggregate of `/users/me`, `/notifications`, saved collections, upcoming
  events/matches.

### `/search` — Global search
Single box → typed result sections (players, courts, stores, coaches, events,
clubs, equipment). Debounced, ranked by relevance + proximity.
- Data: `GET /search?q=&types=`.

### `/settings`
Account, profile, privacy, notification preferences, theme, connected social
accounts, sessions/devices, danger zone (delete account).

---

## Admin

### `/admin/**` — Admin panel (P0, role-gated)
Dashboard, users, posts, courts, stores, reports, analytics, moderation,
tournaments. Full spec: [`13-admin-dashboard.md`](./13-admin-dashboard.md).

---

## Cross-page states & patterns

- **Loading:** skeletons that match final layout (no spinners for content).
- **Empty:** purposeful `EmptyState` with a next action (e.g. "No courts nearby —
  add one" for owners, "Follow players" for feed).
- **Error:** inline recoverable errors + retry; toasts for transient failures.
- **Realtime:** live regions announce new messages, occupancy, notifications.
- **Auth gates:** guest actions open a sign-up sheet, preserving intent.
- **Notifications bell:** unread badge; dropdown of recent; link to full list.
