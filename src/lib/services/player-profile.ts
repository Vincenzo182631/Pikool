import "server-only";
import { db } from "@/lib/db";
import { SKILL_META } from "@/lib/constants";
import { activityLabel } from "@/lib/activity";
import type { ActivityType } from "@prisma/client";
import type { ActivityKind, GalleryCategory, PlayerProfileData } from "@/types/player-profile";

/** Activity types that are safe to surface on a public profile timeline. */
const PUBLIC_ACTIVITY: ReadonlySet<ActivityType> = new Set([
  "REGISTER",
  "EMAIL_VERIFIED",
  "PROFILE_UPDATED",
  "ROLE_GRANTED",
]);

const ACTIVITY_KIND: Partial<Record<ActivityType, ActivityKind>> = {
  REGISTER: "join",
  EMAIL_VERIFIED: "generic",
  PROFILE_UPDATED: "profile",
  ROLE_GRANTED: "achievement",
};

/** Map a post type to a gallery/lifestyle category. */
function galleryCategory(type: string): GalleryCategory {
  if (type === "TOURNAMENT_NEWS") return "Tournament";
  if (type === "TRAINING_TIP") return "Training";
  if (type === "PADDLE_REVIEW" || type === "COURT_REVIEW") return "Equipment";
  return "Lifestyle";
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function levelTier(rating: number): PlayerProfileData["levelTier"] {
  if (rating < 3) return "Beginner";
  if (rating < 4) return "Intermediate";
  if (rating < 5) return "Advanced";
  return "Pro";
}

const AVAILABILITY_LABELS: Record<string, string> = {
  WEEKDAY_MORNINGS: "Weekday mornings",
  WEEKDAY_AFTERNOONS: "Weekday afternoons",
  WEEKDAY_EVENINGS: "Weekday evenings",
  WEEKENDS: "Weekends",
};

/**
 * Fetch and shape everything the premium player card needs. Returns null when
 * the profile doesn't exist. Respects the profile owner's privacy settings for
 * a viewer who isn't the owner.
 */
export async function getPlayerProfile(
  username: string,
  viewerId: string | null,
): Promise<PlayerProfileData | null> {
  const profile = await db.profile.findUnique({
    where: { username },
    include: {
      homeCourt: { select: { name: true, city: true } },
      user: {
        include: {
          settings: true,
          badges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
          achievements: { include: { achievement: true }, orderBy: { awardedAt: "desc" } },
        },
      },
    },
  });
  if (!profile) return null;

  const userId = profile.userId;
  const isOwner = viewerId === userId;
  const settings = profile.user.settings;
  const showStats = isOwner || settings?.showStats !== false;
  const showLocation = isOwner || settings?.showLocation !== false;

  const [ratingHistory, activityLogs, mediaPosts] = await Promise.all([
    db.ratingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 60,
      select: { id: true, value: true, delta: true, createdAt: true },
    }),
    db.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, type: true, message: true, createdAt: true },
    }),
    db.post.findMany({
      where: { authorId: userId, deletedAt: null, mediaUrls: { isEmpty: false } },
      orderBy: { createdAt: "desc" },
      take: 48,
      select: { id: true, type: true, mediaUrls: true, createdAt: true },
    }),
  ]);

  const fullName = [profile.user.firstName, profile.user.lastName].filter(Boolean).join(" ");
  const winPct = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;
  const meta = SKILL_META[profile.skillLevel];

  // Medals derived from badge tiers.
  const medals = { gold: 0, silver: 0, bronze: 0 };
  for (const ub of profile.user.badges) {
    if (ub.badge.tier === "GOLD" || ub.badge.tier === "PLATINUM") medals.gold++;
    else if (ub.badge.tier === "SILVER") medals.silver++;
    else if (ub.badge.tier === "BRONZE") medals.bronze++;
  }

  // Gallery: flatten media across the player's posts.
  const gallery = mediaPosts.flatMap((p) =>
    p.mediaUrls.map((url, i) => ({
      id: `${p.id}-${i}`,
      url,
      category: galleryCategory(p.type),
      date: p.createdAt.toISOString(),
      postId: p.id,
    })),
  );

  // Activity timeline: merge audit-log entries (public subset for visitors)
  // with the player's own post/media activity, newest first.
  type Item = PlayerProfileData["activity"][number];
  const logItems: Item[] = activityLogs
    .filter((a) => isOwner || PUBLIC_ACTIVITY.has(a.type))
    .map((a) => ({
      id: `log-${a.id}`,
      kind: ACTIVITY_KIND[a.type] ?? "generic",
      title: a.type === "REGISTER" ? "Joined PicklePlay" : activityLabel(a.type, a.message),
      detail: null,
      date: a.createdAt.toISOString(),
    }));

  const postItems: Item[] = mediaPosts.slice(0, 20).map((p) => {
    const n = p.mediaUrls.length;
    return {
      id: `post-${p.id}`,
      kind: n > 0 ? "media" : "post",
      title: n > 0 ? `Uploaded ${n} photo${n === 1 ? "" : "s"}` : "Shared a post",
      detail: galleryCategory(p.type),
      date: p.createdAt.toISOString(),
    };
  });

  const activity = [...logItems, ...postItems]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 14);

  return {
    isOwner,
    username: profile.username,
    displayName: profile.displayName || fullName || `@${profile.username}`,
    fullName,
    avatarUrl: profile.avatarUrl,
    coverUrl: profile.coverUrl,
    bio: profile.bio,
    city: profile.city,
    country: profile.country,
    showLocation,
    showStats,

    skillLevel: profile.skillLevel,
    ratingLabel: profile.ratingValue.toFixed(1),
    levelLabel: meta?.label ?? "Unrated",
    levelTier: levelTier(profile.ratingValue),

    dominantHand: titleCase(profile.dominantHand),
    yearsPlaying: profile.yearsPlaying,
    favoritePaddle: profile.favoritePaddle,
    playingStyle: profile.playingStyle,
    homeCourt: profile.homeCourt ? { name: profile.homeCourt.name, city: profile.homeCourt.city } : null,
    formats: profile.formats.map(titleCase),
    availability: profile.availability.map((a) => AVAILABILITY_LABELS[a] ?? titleCase(a)),
    memberSince: profile.user.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" }),

    stats: {
      rating: profile.ratingValue,
      games: profile.gamesPlayed,
      wins: profile.wins,
      losses: profile.losses,
      winPct,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      followers: profile.followersCount,
      following: profile.followingCount,
    },
    medals,

    badges: profile.user.badges.map((ub) => ({
      id: ub.id,
      name: ub.badge.name,
      description: ub.badge.description,
      tier: ub.badge.tier,
      date: ub.awardedAt.toISOString(),
    })),
    achievements: profile.user.achievements.map((ua) => ({
      id: ua.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      date: ua.awardedAt.toISOString(),
    })),

    ratingSeries: ratingHistory.map((r) => ({
      t: r.createdAt.toISOString(),
      v: r.value,
      win: r.delta >= 0,
    })),

    activity,
    gallery,
  };
}
