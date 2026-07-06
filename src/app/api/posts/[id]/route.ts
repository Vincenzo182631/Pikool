import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

/** Soft-delete a post (author or admin). */
export const DELETE = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;

  const post = await db.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) throw new ApiError("NOT_FOUND", "Post not found.");

  const isAdmin = user.roles.some((r) => r.role === "ADMIN");
  if (post.authorId !== user.id && !isAdmin) {
    throw new ApiError("FORBIDDEN", "You can only delete your own posts.");
  }

  await db.post.update({ where: { id }, data: { deletedAt: new Date() } });
  return ok({ deleted: true });
});
