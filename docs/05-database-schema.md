# 05 — Database Schema

PostgreSQL, accessed via **Prisma**. This schema is **canonical** — the app and
API conform to it. Below is the domain model, then the Prisma schema.

## Design principles

- Normalized (3NF) with deliberate denormalized counters (e.g. cached
  `followersCount`) updated transactionally for read performance.
- Every table has `id` (cuid), `createdAt`, `updatedAt`.
- Soft-delete (`deletedAt`) on user-generated content that can be moderated.
- Money as integer cents; distances in meters; coordinates as `Float`
  lat/lng (+ optional PostGIS for geo queries).
- Enums for closed sets (roles, skill levels, statuses).

## Domain map

- **Identity:** `User`, `Account` (OAuth), `Session`, `VerificationToken`,
  `Profile`, `Role` (via `UserRole`).
- **Social:** `Follow`, `Friendship`, `Post`, `Comment`, `Reaction`, `Bookmark`,
  `Report`.
- **Play:** `Court`, `CourtPhoto`, `CheckIn`, `Match`, `MatchParticipant`,
  `AvailabilitySignal` ("I'm Available"), `Review`.
- **Ratings:** `RatingHistory`, `Achievement`, `UserAchievement`, `Reputation`.
- **Messaging:** `Conversation`, `ConversationMember`, `Message`.
- **Community:** `Club`, `ClubMember`, `Event`, `EventAttendee`.
- **Competition:** `Tournament`, `TournamentEntry`, `BracketMatch`.
- **Commerce:** `Store`, `Product`, `Listing` (marketplace).
- **System:** `Notification`, `Place` (POIs: parking/water/etc.).

## Entity relationships (summary)

- `User 1—1 Profile`; `User 1—* UserRole`; `User 1—* Account`.
- `User *—* User` via `Follow` (directional) and `Friendship` (mutual).
- `Court 1—* CheckIn`, `1—* Review`, `1—* CourtPhoto`; `User *—* Court` via
  saved courts.
- `Match *—* User` via `MatchParticipant` (with team + result).
- `Conversation 1—* Message`; `Conversation *—* User` via `ConversationMember`.
- `Club 1—* ClubMember`, `1—* Event`; `Event 1—* EventAttendee`.
- `Tournament 1—* TournamentEntry`, `1—* BracketMatch`.
- `Store 1—* Product`; `User 1—* Listing` (marketplace).

## Prisma schema

```prisma
// packages/db/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

// ---------- Enums ----------
enum RoleName {
  PLAYER
  VERIFIED_COACH
  CLUB_OWNER
  STORE_OWNER
  COURT_OWNER
  TOURNAMENT_ORGANIZER
  ADMIN
}

enum SkillLevel {
  L2_0  // Beginner
  L2_5  // Novice
  L3_0  // Developing
  L3_5  // Intermediate
  L4_0  // Advanced
  L4_5  // Competitive
  L5_0  // Elite
  L5_5  // Professional
}

enum DominantHand { LEFT RIGHT AMBIDEXTROUS }
enum PlayFormat { SINGLES DOUBLES MIXED }
enum CourtSurface { CONCRETE ASPHALT ACRYLIC WOOD OTHER }
enum CourtEnvironment { INDOOR OUTDOOR }
enum PostType { GAME_INVITE MATCH_RESULT COURT_REVIEW PADDLE_REVIEW TRAINING_TIP TOURNAMENT_NEWS PHOTO VIDEO POLL }
enum ReactionType { LIKE }
enum ConversationType { DIRECT GROUP CLUB TOURNAMENT }
enum EventType { CLINIC LESSON OPEN_PLAY LEAGUE SOCIAL TOURNAMENT }
enum MatchResult { WIN LOSS DRAW }
enum ListingCondition { NEW LIKE_NEW GOOD FAIR POOR }
enum ReportStatus { OPEN REVIEWING RESOLVED DISMISSED }
enum NotificationType { MESSAGE FRIEND_REQUEST GAME_INVITE CHECKIN TOURNAMENT WEATHER SYSTEM }
enum PlaceType { PARKING RESTROOM WATER COFFEE RESTAURANT HOTEL }

// ---------- Identity ----------
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  profile       Profile?
  roles         UserRole[]
  accounts      Account[]
  sessions      Session[]

  posts         Post[]
  comments      Comment[]
  reactions     Reaction[]
  bookmarks     Bookmark[]
  checkIns      CheckIn[]
  reviews       Review[]
  matches       MatchParticipant[]
  availability  AvailabilitySignal[]
  ratingHistory RatingHistory[]
  achievements  UserAchievement[]
  reputation    Reputation?
  notifications Notification[]
  listings      Listing[]

  following     Follow[]  @relation("follower")
  followers     Follow[]  @relation("followee")
  clubs         ClubMember[]
  eventRsvps    EventAttendee[]
  tournamentEntries TournamentEntry[]
  conversations ConversationMember[]
  messages      Message[]
  savedCourts   SavedCourt[]

  @@index([email])
}

model Profile {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  firstName    String
  lastName     String
  username     String   @unique
  avatarUrl    String?
  coverUrl     String?
  bio          String?
  city         String?
  country      String?
  skillLevel   SkillLevel @default(L2_5)
  ratingValue  Float    @default(2.5) // continuous DUPR-style value
  dominantHand DominantHand @default(RIGHT)
  playingStyle String?
  yearsPlaying Int      @default(0)
  favoritePaddle String?
  formats      PlayFormat[]
  homeCourtId  String?
  homeCourt    Court?   @relation(fields: [homeCourtId], references: [id])
  gamesPlayed  Int      @default(0)
  wins         Int      @default(0)
  losses       Int      @default(0)
  currentStreak Int     @default(0)
  longestStreak Int     @default(0)
  followersCount Int    @default(0)
  followingCount Int    @default(0)

  @@index([username])
  @@index([city, country])
}

model UserRole {
  id     String   @id @default(cuid())
  userId String
  user   User     @relation(fields: [userId], references: [id])
  role   RoleName
  @@unique([userId, role])
}

model Account {   // OAuth providers
  id                String @id @default(cuid())
  userId            String
  user              User   @relation(fields: [userId], references: [id])
  provider          String // google | apple | facebook
  providerAccountId String
  @@unique([provider, providerAccountId])
}

model Session {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  refreshTokenHash String
  userAgent     String?
  ip            String?
  expiresAt     DateTime
  createdAt     DateTime @default(now())
}

model VerificationToken {
  id        String   @id @default(cuid())
  email     String
  codeHash  String   // hashed OTP
  purpose   String   // EMAIL_VERIFY | PASSWORD_RESET
  expiresAt DateTime
  consumedAt DateTime?
  @@index([email, purpose])
}

// ---------- Social ----------
model Follow {
  id         String @id @default(cuid())
  followerId String
  followeeId String
  follower   User   @relation("follower", fields: [followerId], references: [id])
  followee   User   @relation("followee", fields: [followeeId], references: [id])
  createdAt  DateTime @default(now())
  @@unique([followerId, followeeId])
}

model Friendship {
  id        String @id @default(cuid())
  aUserId   String
  bUserId   String
  status    String // PENDING | ACCEPTED | BLOCKED
  createdAt DateTime @default(now())
  @@unique([aUserId, bUserId])
}

model Post {
  id        String   @id @default(cuid())
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  type      PostType
  body      String?
  mediaUrls String[]
  meta      Json?    // type-specific payload (poll options, result, etc.)
  clubId    String?
  createdAt DateTime @default(now())
  deletedAt DateTime?
  comments  Comment[]
  reactions Reaction[]
  bookmarks Bookmark[]
  @@index([authorId, createdAt])
  @@index([type, createdAt])
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  body      String
  createdAt DateTime @default(now())
  deletedAt DateTime?
}

model Reaction {
  id     String @id @default(cuid())
  postId String
  userId String
  type   ReactionType @default(LIKE)
  post   Post @relation(fields: [postId], references: [id])
  user   User @relation(fields: [userId], references: [id])
  @@unique([postId, userId, type])
}

model Bookmark {
  id     String @id @default(cuid())
  postId String
  userId String
  post   Post @relation(fields: [postId], references: [id])
  user   User @relation(fields: [userId], references: [id])
  @@unique([postId, userId])
}

model Report {
  id          String   @id @default(cuid())
  reporterId  String
  targetType  String   // POST | COMMENT | USER | LISTING | REVIEW
  targetId    String
  reason      String
  status      ReportStatus @default(OPEN)
  createdAt   DateTime @default(now())
  resolvedById String?
  @@index([status, createdAt])
}

// ---------- Courts & Play ----------
model Court {
  id          String   @id @default(cuid())
  name        String
  ownerId     String?
  lat         Float
  lng         Float
  address     String?
  city        String?
  country     String?
  surface     CourtSurface @default(ACRYLIC)
  environment CourtEnvironment @default(OUTDOOR)
  hasLighting Boolean  @default(false)
  amenities   String[]
  openPlaySchedule Json?
  ratingAvg   Float    @default(0)
  ratingCount Int      @default(0)
  createdAt   DateTime @default(now())

  photos      CourtPhoto[]
  checkIns    CheckIn[]
  reviews     Review[]
  homeProfiles Profile[]
  savedBy     SavedCourt[]
  @@index([lat, lng])
  @@index([city, country])
}

model CourtPhoto {
  id      String @id @default(cuid())
  courtId String
  court   Court  @relation(fields: [courtId], references: [id])
  url     String
}

model SavedCourt {
  id      String @id @default(cuid())
  userId  String
  courtId String
  user    User  @relation(fields: [userId], references: [id])
  court   Court @relation(fields: [courtId], references: [id])
  @@unique([userId, courtId])
}

model CheckIn {
  id        String   @id @default(cuid())
  courtId   String
  userId    String
  court     Court    @relation(fields: [courtId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  expiresAt DateTime // auto-expire to keep occupancy fresh
  @@index([courtId, expiresAt])
}

model Review {
  id        String   @id @default(cuid())
  courtId   String?
  storeId   String?
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  rating    Int      // 1..5
  body      String?
  createdAt DateTime @default(now())
  court     Court?   @relation(fields: [courtId], references: [id])
  store     Store?   @relation(fields: [storeId], references: [id])
}

model AvailabilitySignal {  // "I'm Available"
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  format    PlayFormat
  lat       Float
  lng       Float
  radiusM   Int      @default(10000)
  startsAt  DateTime
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([expiresAt])
}

model Match {
  id          String   @id @default(cuid())
  courtId     String?
  format      PlayFormat
  playedAt    DateTime @default(now())
  scoreSummary String? // e.g. "11-7, 11-9"
  confirmed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  participants MatchParticipant[]
}

model MatchParticipant {
  id       String @id @default(cuid())
  matchId  String
  userId   String
  team     Int     // 1 or 2
  result   MatchResult
  match    Match  @relation(fields: [matchId], references: [id])
  user     User   @relation(fields: [userId], references: [id])
  @@unique([matchId, userId])
}

// ---------- Ratings & rep ----------
model RatingHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  value     Float
  delta     Float
  matchId   String?
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
}

model Achievement {
  id          String @id @default(cuid())
  key         String @unique
  name        String
  description String
  iconUrl     String?
  users       UserAchievement[]
}

model UserAchievement {
  id            String @id @default(cuid())
  userId        String
  achievementId String
  awardedAt     DateTime @default(now())
  user          User @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  @@unique([userId, achievementId])
}

model Reputation {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
  score  Int    @default(0)   // community trust, distinct from skill
  @@index([score])
}

// ---------- Messaging ----------
model Conversation {
  id        String   @id @default(cuid())
  type      ConversationType
  title     String?
  clubId    String?
  createdAt DateTime @default(now())
  members   ConversationMember[]
  messages  Message[]
}

model ConversationMember {
  id             String @id @default(cuid())
  conversationId String
  userId         String
  lastReadAt     DateTime?
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  user           User @relation(fields: [userId], references: [id])
  @@unique([conversationId, userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  body           String?
  mediaUrls      String[]
  kind           String   @default("text") // text|image|voice|location|court_invite
  meta           Json?
  createdAt      DateTime @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  sender         User @relation(fields: [senderId], references: [id])
  @@index([conversationId, createdAt])
}

// ---------- Clubs & Events ----------
model Club {
  id          String   @id @default(cuid())
  ownerId     String
  name        String
  slug        String   @unique
  description String?
  avatarUrl   String?
  city        String?
  country     String?
  createdAt   DateTime @default(now())
  members     ClubMember[]
  events      Event[]
}

model ClubMember {
  id      String @id @default(cuid())
  clubId  String
  userId  String
  role    String // OWNER | ADMIN | MEMBER
  status  String // PENDING | ACTIVE
  club    Club @relation(fields: [clubId], references: [id])
  user    User @relation(fields: [userId], references: [id])
  @@unique([clubId, userId])
}

model Event {
  id          String   @id @default(cuid())
  type        EventType
  title       String
  description String?
  clubId      String?
  courtId     String?
  hostId      String
  startsAt    DateTime
  endsAt      DateTime?
  capacity    Int?
  priceCents  Int?
  club        Club? @relation(fields: [clubId], references: [id])
  attendees   EventAttendee[]
  @@index([startsAt])
}

model EventAttendee {
  id       String @id @default(cuid())
  eventId  String
  userId   String
  status   String // GOING | WAITLIST | DECLINED
  event    Event @relation(fields: [eventId], references: [id])
  user     User @relation(fields: [userId], references: [id])
  @@unique([eventId, userId])
}

// ---------- Tournaments ----------
model Tournament {
  id            String   @id @default(cuid())
  organizerId   String
  name          String
  description   String?
  format        PlayFormat
  startsAt      DateTime
  registrationClosesAt DateTime?
  status        String   // DRAFT | OPEN | IN_PROGRESS | COMPLETED
  entries       TournamentEntry[]
  bracket       BracketMatch[]
}

model TournamentEntry {
  id           String @id @default(cuid())
  tournamentId String
  userId       String
  seed         Int?
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  user         User @relation(fields: [userId], references: [id])
  @@unique([tournamentId, userId])
}

model BracketMatch {
  id           String @id @default(cuid())
  tournamentId String
  round        Int
  slot         Int
  aEntryId     String?
  bEntryId     String?
  winnerEntryId String?
  score        String?
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  @@index([tournamentId, round])
}

// ---------- Commerce ----------
model Store {
  id        String   @id @default(cuid())
  ownerId   String?
  name      String
  lat       Float
  lng       Float
  address   String?
  website   String?
  phone     String?
  hours     Json?
  ratingAvg Float    @default(0)
  ratingCount Int    @default(0)
  products  Product[]
  reviews   Review[]
  @@index([lat, lng])
}

model Product {
  id       String @id @default(cuid())
  storeId  String
  name     String
  category String // paddle|ball|shoe|grip|bag|apparel|accessory
  priceCents Int?
  imageUrl String?
  store    Store @relation(fields: [storeId], references: [id])
}

model Listing {   // marketplace (peer-to-peer used gear)
  id         String   @id @default(cuid())
  sellerId   String
  seller     User     @relation(fields: [sellerId], references: [id])
  title      String
  category   String
  condition  ListingCondition
  priceCents Int
  photos     String[]
  city       String?
  status     String   @default("ACTIVE") // ACTIVE | SOLD | REMOVED
  createdAt  DateTime @default(now())
  @@index([category, status])
}

// ---------- POIs & Notifications ----------
model Place {   // parking, restroom, water, coffee, restaurant, hotel
  id        String @id @default(cuid())
  type      PlaceType
  name      String
  lat       Float
  lng       Float
  @@index([type, lat, lng])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  body      String?
  data      Json?
  readAt    DateTime?
  createdAt DateTime @default(now())
  @@index([userId, readAt])
}
```

## Notes for implementers

- **Derived stats** (`gamesPlayed`, `wins`, streaks, `followersCount`) are
  maintained transactionally when the underlying event is recorded — never edited
  directly by users.
- **Geo queries** ("courts within N km"): start with a bounding-box filter on
  `lat/lng` indexes; adopt PostGIS `ST_DWithin` when precision/volume demands it.
- **Occupancy** is computed from non-expired `CheckIn` rows and mirrored in a
  Redis counter for realtime reads (see `10`, `11`).
- Migrations are managed by Prisma Migrate; review every migration in PRs.
