import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

/** Toggle whether the current user has saved this court. */
export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;

  const court = await db.court.findUnique({ where: { id }, select: { id: true } });
  if (!court) throw new ApiError("NOT_FOUND", "Court not found.");

  const existing = await db.savedCourt.findUnique({
    where: { userId_courtId: { userId: user.id, courtId: id } },
    select: { id: true },
  });

  if (existing) {
    await db.savedCourt.delete({ where: { id: existing.id } });
    return ok({ saved: false });
  }
  await db.savedCourt.create({ data: { userId: user.id, courtId: id } });
  return ok({ saved: true });
});
