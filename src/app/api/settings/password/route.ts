import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/activity";
import { enforceRateLimit } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/validation/settings";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  const user = await requireUser();
  enforceRateLimit({ key: `change-pw:${user.id}`, limit: 5, windowMs: 15 * 60 * 1000 });

  const input = changePasswordSchema.parse(await req.json());
  if (!user.passwordHash) {
    throw new ApiError("FORBIDDEN", "This account has no password set.");
  }
  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) throw new ApiError("VALIDATION_ERROR", "Current password is incorrect.");

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
  await logActivity({ userId: user.id, type: "PASSWORD_CHANGED" });

  return ok({ changed: true });
});
