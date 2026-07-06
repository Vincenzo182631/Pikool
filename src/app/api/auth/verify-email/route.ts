import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { hashOtp } from "@/lib/auth/otp";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { createSession } from "@/lib/auth/session";
import { verifyEmailSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  enforceRateLimit({
    key: `verify:${clientIp(req)}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  const { email, code } = verifyEmailSchema.parse(await req.json());

  const token = await db.verificationToken.findFirst({
    where: {
      email,
      purpose: "EMAIL_VERIFY",
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (!token || token.codeHash !== hashOtp(code)) {
    throw new ApiError("VALIDATION_ERROR", "Invalid or expired code.");
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { roles: true },
  });
  if (!user) throw new ApiError("NOT_FOUND", "Account not found.");

  await db.$transaction([
    db.verificationToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    }),
    db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: user.emailVerified ?? new Date(),
        roles: user.roles.length
          ? undefined
          : { create: { role: "PLAYER" } },
      },
    }),
  ]);

  await createSession({
    id: user.id,
    roles: user.roles.length ? user.roles.map((r) => r.role) : ["PLAYER"],
    emailVerified: true,
  });

  const hasProfile = Boolean(
    await db.profile.findUnique({ where: { userId: user.id }, select: { id: true } }),
  );

  return ok({ verified: true, onboarded: hasProfile });
});
