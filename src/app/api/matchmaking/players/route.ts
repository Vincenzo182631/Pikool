import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { playersQuerySchema } from "@/lib/validation/matchmaking";
import { boundingBox, distanceMeters, serializeAvailablePlayer, skillRank } from "@/lib/services/matchmaking";
import type { AvailablePlayer } from "@/types/matchmaking";

export const runtime = "nodejs";

/** Nearby players who are currently broadcasting availability. */
export const GET = route(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const q = playersQuerySchema.parse(Object.fromEntries(url.searchParams));

  const now = new Date();
  const box = boundingBox(q.lat, q.lng, q.radiusKm);
  const minRank = q.minSkill ? skillRank(q.minSkill) : -Infinity;
  const maxRank = q.maxSkill ? skillRank(q.maxSkill) : Infinity;

  const signals = await db.availabilitySignal.findMany({
    where: {
      userId: { not: user.id },
      expiresAt: { gt: now },
      lat: { gte: box.minLat, lte: box.maxLat },
      lng: { gte: box.minLng, lte: box.maxLng },
      ...(q.format ? { format: q.format } : {}),
    },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  // Pending requests between me and anyone, to annotate cards.
  const pending = await db.matchRequest.findMany({
    where: {
      status: "PENDING",
      OR: [{ fromUserId: user.id }, { toUserId: user.id }],
    },
    select: { id: true, fromUserId: true, toUserId: true },
  });
  const reqByUser = new Map<string, { status: "sent" | "incoming"; id: string }>();
  for (const r of pending) {
    const otherId = r.fromUserId === user.id ? r.toUserId : r.fromUserId;
    reqByUser.set(otherId, { status: r.fromUserId === user.id ? "sent" : "incoming", id: r.id });
  }

  const maxM = q.radiusKm * 1000;
  const seen = new Set<string>();
  const players: AvailablePlayer[] = [];
  for (const s of signals) {
    if (seen.has(s.userId)) continue;
    if (!s.user.profile) continue; // only onboarded players are matchable
    const rank = skillRank(s.user.profile.skillLevel);
    if (rank < minRank || rank > maxRank) continue;
    if (distanceMeters({ lat: q.lat, lng: q.lng }, s) > maxM) continue;
    seen.add(s.userId);
    players.push(serializeAvailablePlayer(s, { lat: q.lat, lng: q.lng }, reqByUser.get(s.userId) ?? null));
    if (players.length >= q.limit) break;
  }

  players.sort((a, b) => a.distanceM - b.distanceM);

  const mySignal = await db.availabilitySignal.findFirst({
    where: { userId: user.id, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });

  return ok(
    {
      players,
      myAvailability: mySignal
        ? {
            id: mySignal.id,
            format: mySignal.format,
            radiusM: mySignal.radiusM,
            startsAt: mySignal.startsAt.toISOString(),
            expiresAt: mySignal.expiresAt.toISOString(),
          }
        : null,
    },
    { meta: { count: players.length } },
  );
});
