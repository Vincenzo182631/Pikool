# 00 — Project Overview

## Product

**PicklePlay** — _The Ultimate Pickleball Community._

The world's best all-in-one pickleball platform. One home for everything a
player, coach, club, or organizer does around the sport: find courts and people,
organize and record games, grow skills, buy and sell gear, run clubs and
tournaments, and stay connected in real time.

Repo codename: **`pikool`**.

## Vision

Pickleball is the fastest-growing sport in the world, but its digital experience
is fragmented across group chats, spreadsheets, generic social networks, and
paper brackets. PicklePlay unifies the entire pickleball lifecycle into a single,
premium, map-centric product that feels as good to use as the best consumer apps.

> **North-star:** a player opens PicklePlay and, within seconds, can see who is
> playing near them, join or start a game, and know exactly where to go.

## Goals

1. **Discovery** — the definitive map of courts, players, coaches, clubs, stores,
   and tournaments.
2. **Play** — frictionless matchmaking, court check-ins, and game organization.
3. **Progress** — meaningful skill ratings, stats, achievements, and leaderboards.
4. **Community** — clubs, chat, events, and a pickleball-focused feed.
5. **Commerce** — store locator + peer marketplace for equipment.
6. **Competition** — full tournament lifecycle: registration → brackets → results.

## Non-goals (for v1)

- Not a generic social network / Facebook clone.
- Not a payments processor for merchandise (store locator links out; marketplace
  is discovery + chat, not checkout — see roadmap).
- Not a live-streaming platform.
- No native mobile apps at launch (responsive PWA-ready web first; native later).

## Primary personas

| Persona | Needs |
|---------|-------|
| **Casual Player** | Find nearby open play at their level, quickly. |
| **Competitive Player** | Track rating/record, find worthy opponents, enter tournaments. |
| **Coach** | Be discoverable, list clinics/lessons, manage a roster. |
| **Club Owner** | Run a club: members, events, chat, gallery. |
| **Court / Store Owner** | Manage a listing: photos, hours, amenities, reviews. |
| **Tournament Organizer** | Publish events, run registration and brackets. |
| **Administrator** | Keep the platform safe, healthy, and growing. |

See [`02-user-stories.md`](./02-user-stories.md) for role-by-role stories.

## Product pillars (feature areas)

- **Map & Courts** — interactive map, court detail, check-ins, occupancy.
- **Players & Profiles** — pro-style player cards, stats, follow/friend.
- **Matchmaking** — filters, "I'm Available", nearby notifications.
- **Feed** — pickleball-focused posts (invites, results, reviews, tips).
- **Messaging** — realtime 1:1, group, club, and tournament chats.
- **Events & Tournaments** — clinics, open play, leagues, brackets, results.
- **Commerce** — store locator + used-equipment marketplace.
- **Clubs** — member communities with events, posts, gallery, chat.
- **Dashboard & Notifications** — the player's control center.
- **Admin** — moderation, analytics, platform management.

## Glossary

| Term | Meaning |
|------|---------|
| **DUPR-style rating** | Numeric skill rating 2.0–5.5 (see `12-player-rating.md`). |
| **Open Play** | Drop-in games, typically rotating, at a court. |
| **Check-in** | Marking yourself as currently at a court. |
| **Occupancy / Busy level** | How full a court is right now. |
| **Reputation** | Community-trust score distinct from skill rating. |
| **Club** | A user-created community with members and its own content. |
| **Reel/Post** | A feed item scoped to pickleball content types. |

## Success metrics (v1)

- **Activation:** % of signups that complete onboarding + first check-in or game.
- **Engagement:** weekly active players; games organized per week.
- **Liquidity:** courts with ≥1 daily check-in; matchmaking requests fulfilled.
- **Retention:** week-4 retention of activated players.
- **Trust:** reports resolved < 24h; low ratio of moderated content.

## Scope reference

The authoritative feature list and acceptance criteria are in
[`01-product-requirements.md`](./01-product-requirements.md). Delivery order is in
[`14-roadmap.md`](./14-roadmap.md).
