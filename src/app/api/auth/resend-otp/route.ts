import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { generateOtp, hashOtp, OTP_TTL_MS } from "@/lib/auth/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { resendOtpSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  const { email } = resendOtpSchema.parse(await req.json());

  enforceRateLimit({
    key: `resend:${email}`,
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  const user = await db.user.findUnique({ where: { email } });

  // Only send if the account exists and is unverified — but always respond ok
  // to avoid revealing account existence.
  if (user && !user.emailVerified) {
    // Invalidate prior unconsumed codes.
    await db.verificationToken.updateMany({
      where: { email, purpose: "EMAIL_VERIFY", consumedAt: null },
      data: { consumedAt: new Date() },
    });
    const code = generateOtp();
    await db.verificationToken.create({
      data: {
        email,
        codeHash: hashOtp(code),
        purpose: "EMAIL_VERIFY",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });
    await sendEmail({ to: email, ...otpEmail(code) });
  }

  return ok({ message: "If your account needs verification, a code was sent." });
});
