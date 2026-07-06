import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { broadcastSchema } from "@/lib/validation/matchmaking";
import { boundingBox, distanceMeters } from "@/lib/services/court";
import { notifyMany } from "@/lib/services/notification";

export const runtime = "nodejs";

function serialize(s: {
  id: string;
  format: string;
  radiusM: number;
  startsAt: Date;
  expiresAt: Date;
}) {
  return {
    id: s.id,
    format: s.format,
    radiusM: s.radiusM,
    startsAt: s.startsAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
  };
}

/** My current active availability signal (if any). */
export const GET = route(async () => {
  const user = await requireUser();
  const signal = await db.availabilitySignal.findFirst({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ availability: signal ? serialize(signal) : null });
});

/** Broadcast "I'm available to play" and notify nearby available players. */
export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const input = broadcastSchema.parse(await req.json());

  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.durationMins * 60 * 1000);

  // Keep a single active signal per player.
  await db.availabilitySignal.deleteMany({ where: { userId: user.id } });
  const signal = await db.availabilitySignal.create({
    data: {
      userId: user.id,
      format: input.format,
      lat: input.lat,
      lng: input.lng,
      radiusM: Math.round(input.radiusKm * 1000),
      startsAt: now,
      expiresAt,
    },
  });

  // Fan out to other players who are themselves available within range.
  const box = boundingBox(input.lat, input.lng, input.radiusKm);
  const nearby = await db.availabilitySignal.findMany({
    where: {
      userId: { not: user.id },
      expiresAt: { gt: now },
      lat: { gte: box.minLat, lte: box.maxLat },
      lng: { gte: box.minLng, lte: box.maxLng },
    },
    select: { userId: true, lat: true, lng: true },
  });
  const maxM = input.radiusKm * 1000;
  const targetIds = [
    ...new Set(
      nearby
        .filter((n) => distanceMeters({ lat: input.lat, lng: input.lng }, n) <= maxM)
        .map((n) => n.userId),
    ),
  ];

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.profile?.displayName || "A player";
  const notified = await notifyMany(targetIds, {
    type: "GAME_INVITE",
    title: `${name} is available to play`,
    body: `${input.format.toLowerCase()} nearby — send them an invite for a game.`,
    data: { userId: user.id, kind: "availability" },
    exclude: user.id,
  });

  return ok({ availability: serialize(signal), notified });
});

/** Stop being available. */
export const DELETE = route(async () => {
  const user = await requireUser();
  await db.availabilitySignal.deleteMany({ where: { userId: user.id } });
  return ok({ stopped: true });
});
