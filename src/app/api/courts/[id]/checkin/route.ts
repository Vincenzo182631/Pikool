import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { enforceRateLimit } from "@/lib/rate-limit";
import { busyLevel, checkInExpiry } from "@/lib/services/court";

export const runtime = "nodejs";

/** Check in to a court. You can only be at one court at a time. */
export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  enforceRateLimit({ key: `checkin:${user.id}`, limit: 20, windowMs: 60 * 1000 });

  const court = await db.court.findUnique({ where: { id }, select: { id: true } });
  if (!court) throw new ApiError("NOT_FOUND", "Court not found.");

  await db.$transaction([
    // Leave any other active check-ins (you're now here).
    db.checkIn.deleteMany({ where: { userId: user.id, expiresAt: { gt: new Date() } } }),
    db.checkIn.create({
      data: { courtId: id, userId: user.id, expiresAt: checkInExpiry() },
    }),
  ]);

  const count = await db.checkIn.count({
    where: { courtId: id, expiresAt: { gt: new Date() } },
  });
  return ok({ checkedIn: true, occupancy: count, busyLevel: busyLevel(count) });
});

/** Check out of a court. */
export const DELETE = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;

  await db.checkIn.deleteMany({
    where: { courtId: id, userId: user.id, expiresAt: { gt: new Date() } },
  });

  const count = await db.checkIn.count({
    where: { courtId: id, expiresAt: { gt: new Date() } },
  });
  return ok({ checkedIn: false, occupancy: count, busyLevel: busyLevel(count) });
});
