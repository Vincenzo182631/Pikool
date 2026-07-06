import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  const input = loginSchema.parse(await req.json());

  enforceRateLimit({
    key: `login:${clientIp(req)}:${input.email}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  const user = await db.user.findUnique({
    where: { email: input.email },
    include: { roles: true, profile: { select: { id: true } } },
  });

  // Generic error to prevent user enumeration.
  const invalid = () => new ApiError("UNAUTHENTICATED", "Invalid email or password.");

  if (!user || !user.passwordHash || user.deletedAt) throw invalid();
  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw invalid();

  if (!user.emailVerified) {
    throw new ApiError(
      "FORBIDDEN",
      "Please verify your email before signing in.",
      { code: "EMAIL_UNVERIFIED", email: user.email },
    );
  }

  await createSession({
    id: user.id,
    roles: user.roles.map((r) => r.role),
    emailVerified: true,
  });

  return ok({ onboarded: Boolean(user.profile) });
});
