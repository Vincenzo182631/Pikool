import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { enforceRateLimit } from "@/lib/rate-limit";
import { reportSchema } from "@/lib/validation/post";

export const runtime = "nodejs";

/** Report a post for moderation. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  enforceRateLimit({ key: `report:${user.id}`, limit: 10, windowMs: 60 * 1000 });

  const { reason } = reportSchema.parse(await req.json());
  await db.report.create({
    data: { reporterId: user.id, targetType: "POST", targetId: id, reason },
  });
  return ok({ reported: true });
});
