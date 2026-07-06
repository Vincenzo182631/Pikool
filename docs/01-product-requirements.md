# 01 — Product Requirements (PRD)

This document defines **what** PicklePlay must do. Each feature lists its intent,
key requirements, and acceptance criteria. Priorities: **P0** (launch-critical),
**P1** (fast-follow), **P2** (later).

---

## 1. Accounts & Authentication — P0

**Intent:** secure, low-friction access with email verification required.

Requirements:
- Sign up with email, password, confirm password, verification (OTP) code,
  terms checkbox.
- Login with email/password, "remember me", forgot/reset password.
- Social login: Google, Apple, Facebook.
- **Email verification (OTP) is required before account activation.**
- Passwords hashed (argon2id), never logged.

Acceptance:
- A new account cannot access member features until email is verified.
- Wrong OTP is rate-limited; codes expire (10 min) and are single-use.
- Reset-password links/codes are single-use and time-boxed.

Detail: [`09-authentication.md`](./09-authentication.md).

---

## 2. Onboarding — P0

**Intent:** collect the profile that powers matchmaking and the player card.

Collect after signup: first name, last name, username (unique), profile picture,
city, country, skill level, dominant hand, playing style, years playing, favorite
paddle, availability, and preferred formats (singles / doubles / mixed).

Acceptance:
- Username uniqueness enforced; reserved names blocked.
- Onboarding is resumable; partial progress is saved.
- Skill level uses the official scale (see `12-player-rating.md`).

---

## 3. Player Profile — P0

**Intent:** a professional **player card**, not a social wall.

Displays: profile & cover photo, name, username, skill rating, games played,
wins, losses, win %, current streak, longest win streak, years playing, favorite
paddle, dominant hand, home court, achievements, badges, followers, following,
friends, recent matches, photos, videos, posts.

Acceptance:
- Stats derive from recorded matches (no manual editing of win/loss).
- Privacy controls: profile visibility, who can message/friend.
- Card is fully responsive and looks premium on mobile.

---

## 4. Home Feed — P0

**Intent:** a pickleball-focused feed, not general social noise.

Post types: game invite, match result, court review, paddle review, training
tip, tournament news, photos, videos, polls.
Post actions: like, comment, share, bookmark, report.

Acceptance:
- Feed is personalized (followed players/clubs, nearby activity).
- Each post type renders a purpose-built card.
- Pagination/infinite scroll; new items surface without full reload.

---

## 5. Map — P0

**Intent:** the definitive interactive map of the pickleball world.

Layers: pickleball courts, sport stores, coaches, clubs, tournaments, parking,
restrooms, water stations, coffee shops, restaurants, nearby hotels.

Court detail: photos, rating, reviews, surface, indoor/outdoor, lighting, open
play schedule, busy level, current players checked in, amenities, directions.

Acceptance:
- Map clusters markers at low zoom; filters toggle layers.
- Court detail shows live check-in count and busy level.
- "Directions" deep-links to native maps.

Detail: [`10-map-system.md`](./10-map-system.md).

---

## 6. Court Check-in — P0

**Intent:** show real-time court activity.

Displays: who's currently playing, number of players, estimated wait, skill
levels present, upcoming games. Supports **QR check-in** at the court.

Acceptance:
- Check-ins auto-expire (configurable, default 3h) to keep data fresh.
- Occupancy/busy level updates in realtime for viewers of that court.

---

## 7. Matchmaking — P0

**Intent:** connect nearby, compatible players fast.

Find players with filters: distance, skill, age, availability, singles/doubles,
competitive/casual. **"I'm Available"** broadcasts intent; nearby players get
notified.

Acceptance:
- "I'm Available" has a time window and format; auto-expires.
- Notifications respect distance and skill-match preferences.
- Users can accept/decline; accepted intent can create a game.

---

## 8. Messaging — P0

**Intent:** realtime communication across contexts.

Types: 1:1, group, club, tournament chats. Send: images, locations, court
invites, voice notes. Typing indicators, read receipts, presence.

Acceptance:
- Messages deliver in realtime and persist; offline users get history on return.
- Media is uploaded to Cloudinary; voice notes playable inline.

Detail: [`11-realtime-features.md`](./11-realtime-features.md).

---

## 9. Events — P0/P1

**Intent:** organize structured play.

Types: clinics, lessons, open play, leagues, social games, tournaments.
Views: list + calendar. RSVP, capacity, waitlist.

Acceptance:
- Users can create, RSVP, and see events in a calendar.
- Capacity and waitlist enforced; organizers can manage attendees.

---

## 10. Tournaments — P1

**Intent:** full competitive lifecycle.

Listings, registration, brackets, score tracking, results, awards, live rankings.

Acceptance:
- Organizers create tournaments and open registration windows.
- Brackets generate from the entrant list; scores advance the bracket.
- Results feed player records and leaderboards.

---

## 11. Store Locator — P1

Stores selling paddles, balls, shoes, grips, bags, apparel, accessories.
Store page: photos, products, directions, opening hours, website, phone.

Acceptance: stores appear on the map and in search; owner can manage their page.

---

## 12. Marketplace — P1

Players buy/sell used equipment: condition, photos, price, chat seller, save
listing.

Acceptance: listings are searchable/filterable; contacting a seller opens chat;
listings can be saved and reported.

---

## 13. Clubs — P1

Users create clubs. Club pages: members, events, posts, gallery, chat.

Acceptance: roles within a club (owner/admin/member); club chat is realtime;
join requests and approvals supported.

---

## 14. Player Dashboard — P0

Control center: upcoming matches, messages, notifications, achievements,
statistics, saved courts/stores/players, favorite equipment, settings, privacy.

Acceptance: dashboard aggregates the player's live state; all widgets link to
their source.

---

## 15. Notifications — P0

Realtime: messages, friend requests, game invites, court check-ins, tournament
updates, weather alerts.

Acceptance: in-app realtime + persisted list; per-type mute settings; unread
badge counts are accurate.

---

## 16. Search — P0/P1

Global search across players, courts, stores, coaches, events, clubs, equipment.

Acceptance: single search box with typed result sections; debounced; ranked by
relevance + proximity.

---

## 17. Admin Panel — P0

Dashboard, users, posts, courts, stores, reports, analytics, moderation,
tournaments.

Acceptance: role-gated; moderation actions are audited; analytics reflect real
platform data. Detail: [`13-admin-dashboard.md`](./13-admin-dashboard.md).

---

## 18. Bonus features — P2

Player reputation, weather, court occupancy, achievements, leaderboards, friend
system, follow system, QR court check-in, AI match suggestions, court reviews,
equipment reviews. (Several are P0/P1 above; the rest are enhancements.)

---

## Cross-cutting requirements (apply to everything)

- **Dark mode + light mode**, fully.
- **Responsive** on all breakpoints.
- **Reusable components**, modular features.
- **TypeScript**, proper validation, secure backend, **rate limiting**.
- **Role-based permissions** (see roles in `02` and `09`).
- **Pagination, filtering, sorting** on all list APIs (see `06`).
- **Accessibility** to WCAG AA.
