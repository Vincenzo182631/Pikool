import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { verifyPassword } from "@/lib/auth/password";
import { destroySession } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";

/**
 * Soft-delete the account: mark deletedAt, scrub the profile username so it can
 * be reused, revoke all sessions, and clear cookies. A background job purges
 * fully after the retention window (see docs/16-security.md).
 */
export const DELETE = route(async (req: Request) => {
  const user = await requireUser();
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };

  if (!user.passwordHash || !password || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError("VALIDATION_ERROR", "Password is required to delete your account.");
  }

  await logActivity({ userId: user.id, type: "ACCOUNT_DELETED" });
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } }),
    db.session.deleteMany({ where: { userId: user.id } }),
    // Free the username for reuse.
    db.profile.updateMany({
      where: { userId: user.id },
      data: { username: `deleted_${user.id.slice(0, 8)}` },
    }),
  ]);

  await destroySession();
  return ok({ deleted: true });
});
