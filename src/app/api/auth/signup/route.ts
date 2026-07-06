import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { generateOtp, hashOtp, OTP_TTL_MS } from "@/lib/auth/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  enforceRateLimit({
    key: `signup:${clientIp(req)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  const input = signupSchema.parse(await req.json());

  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    // Avoid user enumeration: same shape, generic guidance.
    throw new ApiError(
      "CONFLICT",
      "An account with that email may already exist. Try signing in.",
    );
  }

  const passwordHash = await hashPassword(input.password);
  await db.user.create({ data: { email: input.email, passwordHash } });

  // Issue an OTP for email verification.
  const code = generateOtp();
  await db.verificationToken.create({
    data: {
      email: input.email,
      codeHash: hashOtp(code),
      purpose: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  await sendEmail({ to: input.email, ...otpEmail(code) });

  return ok(
    { email: input.email, message: "Verification code sent." },
    { status: 201 },
  );
});
