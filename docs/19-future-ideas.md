# 19 — Future Ideas

A parking lot for ideas beyond the committed roadmap (`14`). Nothing here is a
commitment; it's where we capture ambition without derailing the core. Promote an
item to the roadmap only after it's validated against user need.

## Platform & reach

- **Native mobile apps** (React Native) reusing `packages/shared` and the same
  API — push notifications, camera QR check-in, background location for "nearby".
- **PWA**: installable, offline-friendly shells, web push.
- **Internationalization**: multi-language + regional court data.
- **Public API & partner integrations**: court operators, rating bodies (e.g.
  DUPR sync), booking systems.

## Play & matchmaking

- **Smart scheduling**: propose game times from mutual availability + court
  occupancy forecasts.
- **Ladder & league automation**: auto-generated ladders, ELO-seeded leagues,
  season standings and promotions/relegations.
- **Partner finder**: doubles-partner matching by complementary style/rating.
- **Court reservations**: book time slots where operators support it (needs
  payments).
- **Live scorekeeping**: in-app scoreboard during a game that auto-records the
  match.

## Community & content

- **Video analysis / highlights**: upload clips, tag rallies, coach feedback
  (could use Cloudinary video + AI).
- **Coaching marketplace**: bookable lessons with payments, reviews, packages.
- **Challenges & streaks**: gamified goals ("play 3 courts this month").
- **Rich club tools**: dues, rosters, sub-teams, private events.
- **Stories/reels**: short pickleball clips (still pickleball-focused, not generic
  social).

## Competition

- **Advanced tournament formats**: round-robin, pool play, consolation brackets,
  Swiss.
- **Live tournament mode**: real-time bracket + streaming scores + notifications.
- **Officiating tools**: referee assignments, dispute resolution workflows.
- **Rankings & seasons**: regional/national leaderboards, seasonal resets, titles.

## Commerce

- **Full marketplace transactions**: escrow/checkout, shipping, ratings for
  buyers/sellers.
- **Store commerce**: in-app purchase from partner stores, affiliate links.
- **Gear recommendations**: suggest paddles by play style/rating; equipment
  reviews aggregated into buyer guides.

## Intelligence

- **AI match suggestions** (evolve `12`): ML ranking on rating, style,
  availability, reputation, and outcome history.
- **Occupancy forecasting**: predict busy times per court from historical
  check-ins + weather + events.
- **Personalized feed ranking**: relevance model over follows, proximity, and
  interests.
- **Churn/retention signals** for admin (`13`) to drive re-engagement nudges.

## Utility & delight

- **Weather-aware planning**: suggest indoor courts when rain is forecast; alert
  outdoor event hosts (`11`).
- **Carpooling to games/tournaments**.
- **Wearable integration**: import activity/heart-rate for match logs.
- **Accessibility modes**: high-contrast, large-text, reduced-motion presets
  beyond baseline (`07`).

## Trust & safety

- **Reputation tiers & endorsements** surfaced across matchmaking (`12`).
- **Advanced moderation**: ML content flagging, appeals workflow, transparency
  reports (`13`).
- **Verified venues** program for courts/stores.

## How to use this doc

- Add ideas freely with a one-line "why it matters".
- When an idea gets traction: write/expand the relevant spec doc, size it, and
  place it in `14-roadmap.md`. Only then does it become work.
