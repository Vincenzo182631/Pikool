import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Me } from "@/types/user";

/** Canonical include for loading a full user (profile + settings + roles). */
export const userInclude = {
  profile: true,
  settings: true,
  roles: true,
} satisfies Prisma.UserInclude;

export type FullUser = Prisma.UserGetPayload<{ include: typeof userInclude }>;

/** Load a full user by id. */
export function getFullUser(id: string) {
  return db.user.findUnique({ where: { id }, include: userInclude });
}

/**
 * Profile completion: a weighted count of the fields that make a player card
 * feel complete. Drives the dashboard progress meter.
 */
export function computeProfileCompletion(user: FullUser): number {
  const p = user.profile;
  const checks: boolean[] = [
    Boolean(user.firstName && user.lastName),
    Boolean(p?.username),
    Boolean(p?.displayName),
    Boolean(p?.avatarUrl),
    Boolean(p?.coverUrl),
    Boolean(p?.bio),
    Boolean(p?.city || p?.country),
    Boolean(p && p.skillLevel),
    Boolean(p && p.formats.length > 0),
    Boolean(p && p.availability.length > 0),
    Boolean(p?.favoritePaddle),
    Boolean(p && p.yearsPlaying > 0),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/** Serialize a full user into the client-facing `Me` shape. */
export function serializeMe(user: FullUser): Me {
  const p = user.profile;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    emailVerified: Boolean(user.emailVerified),
    roles: user.roles.map((r) => r.role),
    createdAt: user.createdAt.toISOString(),
    profileCompletion: computeProfileCompletion(user),
    profile: p
      ? {
          username: p.username,
          displayName: p.displayName,
          avatarUrl: p.avatarUrl,
          coverUrl: p.coverUrl,
          bio: p.bio,
          city: p.city,
          country: p.country,
          skillLevel: p.skillLevel,
          ratingValue: p.ratingValue,
          dominantHand: p.dominantHand,
          playingStyle: p.playingStyle,
          yearsPlaying: p.yearsPlaying,
          favoritePaddle: p.favoritePaddle,
          formats: p.formats,
          availability: p.availability,
          gamesPlayed: p.gamesPlayed,
          wins: p.wins,
          losses: p.losses,
          currentStreak: p.currentStreak,
          longestStreak: p.longestStreak,
          followersCount: p.followersCount,
          followingCount: p.followingCount,
        }
      : null,
    settings: user.settings
      ? {
          theme: user.settings.theme,
          emailNotifications: user.settings.emailNotifications,
          pushNotifications: user.settings.pushNotifications,
          marketingEmails: user.settings.marketingEmails,
          profileVisibility: user.settings.profileVisibility,
          showLocation: user.settings.showLocation,
          showStats: user.settings.showStats,
        }
      : null,
  };
}

/** Map a skill level to the midpoint of its rating band (see docs/12). */
export function skillMidpoint(level: string): number {
  const map: Record<string, number> = {
    L2_0: 2.1,
    L2_5: 2.5,
    L3_0: 3.0,
    L3_5: 3.5,
    L4_0: 4.0,
    L4_5: 4.5,
    L5_0: 5.0,
    L5_5: 5.4,
  };
  return map[level] ?? 2.5;
}
