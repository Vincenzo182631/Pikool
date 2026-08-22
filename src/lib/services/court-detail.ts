import "server-only";
import { db } from "@/lib/db";
import { busyLevel } from "@/lib/services/court";
import { initials } from "@/lib/utils";
import type { CourtDetail } from "@/types/court";

/** Load and serialize a court's full detail, personalized for `userId` if given. */
export async function getCourtDetail(
  id: string,
  userId?: string,
): Promise<CourtDetail | null> {
  const court = await db.court.findUnique({
    where: { id },
    include: {
      photos: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { author: { include: { profile: true } } },
      },
    },
  });
  if (!court) return null;

  const now = new Date();
  const checkIns = await db.checkIn.findMany({
    where: { courtId: id, expiresAt: { gt: now } },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const players = checkIns.map((ci) => ({
    userId: ci.userId,
    username: ci.user.profile?.username ?? null,
    name: [ci.user.firstName, ci.user.lastName].filter(Boolean).join(" "),
    avatarUrl: ci.user.profile?.avatarUrl ?? null,
    initials: initials(ci.user.firstName, ci.user.lastName),
    skillLevel: ci.user.profile?.skillLevel ?? null,
    since: ci.createdAt.toISOString(),
  }));

  const [savedByMe, myCheckIn] = userId
    ? await Promise.all([
        db.savedCourt.findUnique({
          where: { userId_courtId: { userId, courtId: id } },
          select: { id: true },
        }),
        db.checkIn.findFirst({
          where: { courtId: id, userId, expiresAt: { gt: now } },
          select: { id: true },
        }),
      ])
    : [null, null];

  return {
    id: court.id,
    name: court.name,
    address: court.address,
    city: court.city,
    country: court.country,
    phone: court.phone,
    website: court.website,
    lat: court.lat,
    lng: court.lng,
    surface: court.surface,
    environment: court.environment,
    hasLighting: court.hasLighting,
    amenities: court.amenities,
    openPlaySchedule: court.openPlaySchedule,
    ratingAvg: court.ratingAvg,
    ratingCount: court.ratingCount,
    verified: court.verified,
    pricePerHour: court.pricePerHour,
    photos: court.photos.map((p) => p.url),
    occupancy: players.length,
    busyLevel: busyLevel(players.length),
    skillLevels: [...new Set(players.map((p) => p.skillLevel).filter(Boolean) as string[])],
    players,
    reviews: court.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      author: {
        name: [r.author.firstName, r.author.lastName].filter(Boolean).join(" "),
        username: r.author.profile?.username ?? null,
        avatarUrl: r.author.profile?.avatarUrl ?? null,
        initials: initials(r.author.firstName, r.author.lastName),
      },
    })),
    savedByMe: Boolean(savedByMe),
    checkedInByMe: Boolean(myCheckIn),
  };
}
