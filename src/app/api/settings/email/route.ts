import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { verifyPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/activity";
import { enforceRateLimit } from "@/lib/rate-limit";
import { changeEmailSchema } from "@/lib/validation/settings";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  const user = await requireUser();
  enforceRateLimit({ key: `change-email:${user.id}`, limit: 5, windowMs: 15 * 60 * 1000 });

  const input = changeEmailSchema.parse(await req.json());
  if (!user.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError("VALIDATION_ERROR", "Password is incorrect.");
  }
  if (input.newEmail === user.email) {
    throw new ApiError("VALIDATION_ERROR", "That's already your email.");
  }
  const taken = await db.user.findUnique({ where: { email: input.newEmail } });
  if (taken) throw new ApiError("CONFLICT", "That email is already in use.");

  // Password was re-confirmed, so we trust the change. Production hardening:
  // send an OTP to the new address and require re-verification (see docs/09).
  await db.user.update({ where: { id: user.id }, data: { email: input.newEmail } });
  await logActivity({
    userId: user.id,
    type: "EMAIL_CHANGED",
    message: `Changed email to ${input.newEmail}`,
  });

  return ok({ email: input.newEmail });
});
