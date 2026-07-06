import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { courtsQuerySchema, createCourtSchema } from "@/lib/validation/court";
import { busyLevel, distanceMeters, boundingBox } from "@/lib/services/court";

export const runtime = "nodejs";

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const query = courtsQuerySchema.parse(Object.fromEntries(url.searchParams));
  const user = await getCurrentUser();

  const where: Prisma.CourtWhereInput = {};
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { city: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.surface) where.surface = query.surface;
  if (query.environment) where.environment = query.environment;
  if (query.lighting !== undefined) where.hasLighting = query.lighting;

  const hasCoords = query.lat !== undefined && query.lng !== undefined;
  if (hasCoords && query.radiusKm) {
    const box = boundingBox(query.lat!, query.lng!, query.radiusKm);
    where.lat = { gte: box.minLat, lte: box.maxLat };
    where.lng = { gte: box.minLng, lte: box.maxLng };
  }

  const courts = await db.court.findMany({
    where,
    take: query.limit,
    include: { photos: { take: 1 }, _count: { select: { reviews: true } } },
  });

  const ids = courts.map((c) => c.id);
  const [occupancy, saved] = await Promise.all([
    db.checkIn.groupBy({
      by: ["courtId"],
      where: { courtId: { in: ids }, expiresAt: { gt: new Date() } },
      _count: { _all: true },
    }),
    user
      ? db.savedCourt.findMany({
          where: { userId: user.id, courtId: { in: ids } },
          select: { courtId: true },
        })
      : Promise.resolve([]),
  ]);

  const occByCourt = new Map(occupancy.map((o) => [o.courtId, o._count._all]));
  const savedSet = new Set(saved.map((s) => s.courtId));

  let items = courts.map((c) => {
    const count = occByCourt.get(c.id) ?? 0;
    const distanceM = hasCoords
      ? distanceMeters({ lat: query.lat!, lng: query.lng! }, { lat: c.lat, lng: c.lng })
      : null;
    return {
      id: c.id,
      name: c.name,
      city: c.city,
      country: c.country,
      lat: c.lat,
      lng: c.lng,
      surface: c.surface,
      environment: c.environment,
      hasLighting: c.hasLighting,
      amenities: c.amenities,
      ratingAvg: c.ratingAvg,
      ratingCount: c.ratingCount,
      reviewCount: c._count.reviews,
      verified: c.verified,
      thumbnailUrl: c.photos[0]?.url ?? null,
      occupancy: count,
      busyLevel: busyLevel(count),
      distanceM,
      saved: savedSet.has(c.id),
    };
  });

  // Refine by exact radius when coordinates are provided.
  if (hasCoords && query.radiusKm) {
    const maxM = query.radiusKm * 1000;
    items = items.filter((i) => i.distanceM !== null && i.distanceM <= maxM);
  }

  items.sort((a, b) => {
    if (query.sort === "distance" && hasCoords) {
      return (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity);
    }
    if (query.sort === "name") return a.name.localeCompare(b.name);
    return b.ratingAvg - a.ratingAvg;
  });

  return ok(items, { meta: { count: items.length } });
});

export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const input = createCourtSchema.parse(await req.json());

  // Crowd-sourced courts start unverified until an admin reviews them (docs/10).
  const isAdmin = user.roles.some((r) => r.role === "ADMIN" || r.role === "COURT_OWNER");
  const court = await db.court.create({
    data: {
      ...input,
      ownerId: user.id,
      verified: isAdmin,
    },
  });
  await logActivity({ userId: user.id, type: "PROFILE_UPDATED", message: `Added court ${court.name}` });

  return ok(court, { status: 201 });
});
