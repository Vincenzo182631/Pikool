# 02 — User Stories

Stories are grouped by role. Format: _As a **role**, I want **capability**, so
that **outcome**._ Each has short acceptance notes. Roles map to the permission
model in [`09-authentication.md`](./09-authentication.md).

## Roles

`Guest` · `Player` · `Verified Coach` · `Club Owner` · `Store Owner` ·
`Court Owner` · `Tournament Organizer` · `Administrator`

Roles are additive: a user may hold several (e.g. a Player who is also a Club
Owner). Permissions are the union of held roles.

---

## Guest

- As a guest, I want to browse the map and public court info, so that I can
  evaluate the app before signing up.
  _Accept: read-only map + court detail; actions prompt sign-up._
- As a guest, I want to sign up quickly with email or social login, so that I can
  start playing.
  _Accept: see `09`. Email verification required before member actions._

## Player

- As a player, I want to find nearby open play at my skill level, so that I can
  play today.
  _Accept: map + filters by distance/skill/format; results show busy level._
- As a player, I want to press **"I'm Available"**, so that nearby players know I
  want to play.
  _Accept: broadcast with format + time window; nearby players notified._
- As a player, I want to check in to a court (incl. by QR), so that others see
  who's playing.
  _Accept: live occupancy updates; auto-expiry._
- As a player, I want a professional player card, so that my progress is
  recognized.
  _Accept: stats derived from recorded matches; badges/achievements._
- As a player, I want to record match results, so that my rating and record stay
  accurate.
  _Accept: both participants confirm; updates stats + rating._
- As a player, I want realtime chat (1:1/group), so that I can coordinate games.
  _Accept: media, court invites, voice notes; read receipts._
- As a player, I want notifications for invites/messages/check-ins, so that I
  don't miss games.
  _Accept: realtime + persisted; per-type settings._
- As a player, I want to buy/sell used gear, so that I can upgrade affordably.
  _Accept: listing with condition/photos/price; chat seller; save/report._
- As a player, I want to join clubs and events, so that I have a community.
  _Accept: join requests; RSVP; club chat._
- As a player, I want to save courts/stores/players and favorite equipment, so
  that I can return to them.
  _Accept: saved collections on dashboard._

## Verified Coach

- As a coach, I want a verified badge and discoverable profile, so that players
  can find and trust me.
  _Accept: verification flow; appears in map coach layer + search._
- As a coach, I want to list clinics and lessons as events, so that players can
  book.
  _Accept: event creation with capacity, price, schedule._
- As a coach, I want to manage a roster and message students, so that I can run
  my coaching business.
  _Accept: group chat; participant management._

## Club Owner

- As a club owner, I want to create and manage a club page, so that my community
  has a home.
  _Accept: members, events, posts, gallery, club chat; member roles._
- As a club owner, I want to approve join requests and moderate club content, so
  that the club stays healthy.
  _Accept: approve/deny; remove members/content within the club._

## Store Owner

- As a store owner, I want to manage my store listing, so that players can find
  my shop and products.
  _Accept: photos, products, hours, website, phone; appears on map + locator._
- As a store owner, I want to respond to reviews, so that I can manage
  reputation.
  _Accept: owner reply on reviews._

## Court Owner

- As a court owner, I want to manage my court listing, so that details are
  accurate.
  _Accept: photos, surface, indoor/outdoor, lighting, amenities, open-play
  schedule._
- As a court owner, I want to see check-in analytics, so that I understand usage.
  _Accept: occupancy over time (basic)._

## Tournament Organizer

- As an organizer, I want to publish a tournament and open registration, so that
  players can enter.
  _Accept: listing, registration window, formats, fees._
- As an organizer, I want brackets generated and scores tracked, so that the
  event runs smoothly.
  _Accept: bracket from entrants; score entry advances rounds; results + awards._

## Administrator

- As an admin, I want to review reports and moderate content/users, so that the
  platform stays safe.
  _Accept: queue of reports; actions audited; reversible where possible._
- As an admin, I want platform analytics, so that I can steer growth.
  _Accept: users, activity, content, commerce metrics._
- As an admin, I want to manage courts/stores/tournaments and role grants, so
  that data quality stays high.
  _Accept: CRUD + verification of listings; role assignment._

---

## Story-driven priorities

The P0 slice (see `14-roadmap.md`) is the Player and Guest journeys:
sign-up → onboarding → map → check-in → matchmaking → chat → record match. Owner,
coach, and organizer stories layer on in later phases.
