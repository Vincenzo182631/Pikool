import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

/** Revoke a specific session (sign out that device). */
export const DELETE = route(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await ctx.params;

    const session = await db.session.findUnique({ where: { id } });
    if (!session || session.userId !== user.id) {
      throw new ApiError("NOT_FOUND", "Session not found.");
    }
    await db.session.delete({ where: { id } });
    return ok({ revoked: true });
  },
);
