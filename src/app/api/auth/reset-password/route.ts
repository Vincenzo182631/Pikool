import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { hashOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  enforceRateLimit({ key: `reset:${clientIp(req)}`, limit: 10, windowMs: 15 * 60 * 1000 });
  const { email, code, newPassword } = resetPasswordSchema.parse(await req.json());

  const token = await db.verificationToken.findFirst({
    where: {
      email,
      purpose: "PASSWORD_RESET",
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  });
  if (!token || token.codeHash !== hashOtp(code)) {
    throw new ApiError("VALIDATION_ERROR", "Invalid or expired code.");
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new ApiError("NOT_FOUND", "Account not found.");

  const passwordHash = await hashPassword(newPassword);
  await db.$transaction([
    db.verificationToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } }),
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
    // Revoke all sessions on password reset (see docs/09).
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);

  return ok({ reset: true });
});
