import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

/** Toggle a bookmark on a post. */
export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await db.bookmark.findUnique({
    where: { postId_userId: { postId: id, userId: user.id } },
    select: { id: true },
  });
  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } });
    return ok({ bookmarked: false });
  }
  await db.bookmark.create({ data: { postId: id, userId: user.id } });
  return ok({ bookmarked: true });
});
