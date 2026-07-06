import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { reviewSchema } from "@/lib/validation/court";

export const runtime = "nodejs";

/** Add or update the current user's review for a court, then recompute the average. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const input = reviewSchema.parse(await req.json());

  const court = await db.court.findUnique({ where: { id }, select: { id: true } });
  if (!court) throw new ApiError("NOT_FOUND", "Court not found.");

  const existing = await db.review.findFirst({
    where: { courtId: id, authorId: user.id },
    select: { id: true },
  });

  if (existing) {
    await db.review.update({
      where: { id: existing.id },
      data: { rating: input.rating, body: input.body },
    });
  } else {
    await db.review.create({
      data: { courtId: id, authorId: user.id, rating: input.rating, body: input.body },
    });
  }

  // Recompute the court's aggregate rating.
  const agg = await db.review.aggregate({
    where: { courtId: id },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await db.court.update({
    where: { id },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count._all,
    },
  });

  return ok({ ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count._all });
});
