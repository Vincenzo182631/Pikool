import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { generateOtp, hashOtp, OTP_TTL_MS } from "@/lib/auth/otp";
import { sendEmail, otpEmail, emailVerificationRequired } from "@/lib/email";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { createSession } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
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

  // Instant signup: when no email provider is configured, activate the account
  // immediately and log the user in (skip OTP). Adding RESEND_API_KEY flips this
  // back to the real email-verification flow automatically.
  if (!emailVerificationRequired) {
    const user = await db.user.create({
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash,
        emailVerified: new Date(),
        settings: { create: {} },
        roles: { create: { role: "PLAYER" } },
      },
    });
    await createSession({ id: user.id, roles: ["PLAYER"], emailVerified: true });
    await logActivity({ userId: user.id, type: "REGISTER" });
    return ok(
      { email: input.email, verified: true, onboarded: false },
      { status: 201 },
    );
  }

  await db.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash,
      settings: { create: {} },
    },
  });

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
  // Don't hard-fail signup if the email provider hiccups — the account exists
  // and the user can request a fresh code via "resend".
  let emailSent = true;
  try {
    await sendEmail({ to: input.email, ...otpEmail(code) });
  } catch (err) {
    emailSent = false;
    console.error("[signup] Failed to send verification email:", err);
  }

  return ok(
    {
      email: input.email,
      verified: false,
      emailSent,
      message: emailSent
        ? "Verification code sent."
        : "Account created. Tap “Resend code” to get your verification email.",
    },
    { status: 201 },
  );
});
