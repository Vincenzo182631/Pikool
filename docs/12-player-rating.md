# 12 — Player Rating & Reputation

Two distinct scores:
- **Skill rating** — how well you play (the pickleball scale, 2.0–5.5).
- **Reputation** — how good a community member you are (trust/behavior).

Keep them separate; never conflate skill with trust.

## Skill scale

Official self-assessed / computed levels, stored as `SkillLevel` enum and a
continuous `ratingValue` (`Profile.ratingValue`) for finer matchmaking.

| Level | Label | ratingValue band |
|-------|-------|------------------|
| 2.0 | Beginner | 2.00–2.24 |
| 2.5 | Novice | 2.25–2.74 |
| 3.0 | Developing | 2.75–3.24 |
| 3.5 | Intermediate | 3.25–3.74 |
| 4.0 | Advanced | 3.75–4.24 |
| 4.5 | Competitive | 4.25–4.74 |
| 5.0 | Elite | 4.75–5.24 |
| 5.5 | Professional | 5.25+ |

- **Onboarding:** players self-select a starting level (mapped to the band
  midpoint).
- **Display:** `RatingBadge` shows the nearest labeled level; profiles may show
  the finer `ratingValue` to 1 decimal.

## How rating updates

Ratings move based on **confirmed match results** (`Match` + `MatchParticipant`,
`05`). A match only counts once **both sides confirm** (`POST /matches/:id/confirm`).

### Algorithm (v1): Elo-style with dynamic K

For a match between player `A` and opponent(s) `B`:

```
expectedA = 1 / (1 + 10^((ratingB - ratingA) / 0.5))   // 0.5 ≈ half a skill band
delta     = K * (scoreA - expectedA)                   // scoreA ∈ {1 win, 0 loss, .5 draw}
ratingA' = clamp(ratingA + delta, 2.0, 6.0)
```

- **K-factor** decays with experience: new players (`gamesPlayed < 20`) use a
  higher K (faster convergence); established players use a lower K (stability).
- **Doubles:** use the **team average** rating as the effective rating for each
  side; distribute the delta to each participant (optionally weighted, v2).
- **Margin (v2):** scale delta slightly by score margin (11–2 vs 11–9), capped to
  avoid volatility.
- Every change writes a `RatingHistory` row (`value`, `delta`, `matchId`) →
  powers the profile rating chart.

### Guardrails

- Both participants must confirm; unconfirmed matches don't affect rating.
- Anti-abuse: cap rating gain from repeated matches vs. the same opponent in a
  short window; flag statistically improbable patterns for review.
- Rating never updates from self-reported results without opponent confirmation.

## Derived stats

Maintained transactionally when a confirmed match is recorded (never user-edited):
`gamesPlayed`, `wins`, `losses`, `winPct = wins / gamesPlayed`, `currentStreak`,
`longestStreak`. Displayed on the player card via `StatTile`s.

## Leaderboards

- Global and scoped (city, club, skill band, format) leaderboards ranked by
  `ratingValue` (with a minimum `gamesPlayed` to appear).
- Season-based resets optional (v2) to keep competition fresh.
- Cached in Redis; recomputed on rating changes or periodically.

## Achievements & badges

`Achievement` (catalog) + `UserAchievement` (awards). Awarded by rules evaluated
after relevant events:
- **Milestones:** first match, 10/50/100 games, first win, win streaks (3/5/10).
- **Skill:** reach 3.0 / 3.5 / 4.0 … levels.
- **Community:** first check-in, host an event, join/found a club, review N
  courts.
- **Competition:** enter/win a tournament, podium finish.

Badges render on the player card and feed. Awarding is idempotent
(`@@unique([userId, achievementId])`).

## Reputation (community trust)

`Reputation.score` reflects behavior, distinct from skill:
- **Positive signals:** confirmed matches, showing up (attended RSVPs), helpful
  reviews, endorsements, no valid reports.
- **Negative signals:** no-shows, valid reports/moderation actions, cancellations.
- Used for trust surfaces (e.g. prioritizing reliable players in matchmaking,
  gating certain actions) — **not** shown as a public number that could shame;
  surfaced qualitatively (e.g. "Reliable" tier) where helpful.

## AI match suggestions (P2)

Suggest opponents/partners using `ratingValue` proximity, format preference,
availability overlap, distance, and reputation tier. Start rules-based; layer ML
ranking later. Purely additive to manual matchmaking (`08`).

## Privacy

Players control visibility of detailed stats and rating history in settings
(`09` privacy). Leaderboard participation can be opted out of.
