import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

/** Toggle a like on a post. */
export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await db.reaction.findUnique({
    where: { postId_userId_type: { postId: id, userId: user.id, type: "LIKE" } },
    select: { id: true },
  });
  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
  } else {
    await db.reaction.create({ data: { postId: id, userId: user.id, type: "LIKE" } });
  }

  const likeCount = await db.reaction.count({ where: { postId: id, type: "LIKE" } });
  return ok({ liked: !existing, likeCount });
});
