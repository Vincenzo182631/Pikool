import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { generateOtp, hashOtp, OTP_TTL_MS } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  enforceRateLimit({ key: `forgot:${clientIp(req)}`, limit: 5, windowMs: 15 * 60 * 1000 });
  const { email } = forgotPasswordSchema.parse(await req.json());

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    await db.verificationToken.updateMany({
      where: { email, purpose: "PASSWORD_RESET", consumedAt: null },
      data: { consumedAt: new Date() },
    });
    const code = generateOtp();
    await db.verificationToken.create({
      data: {
        email,
        codeHash: hashOtp(code),
        purpose: "PASSWORD_RESET",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });
    await sendEmail({
      to: email,
      subject: "Your PicklePlay password reset code",
      text: `Your password reset code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your PicklePlay password reset code is <strong style="font-size:20px">${code}</strong>. It expires in 10 minutes.</p>`,
    });
  }

  // Neutral response regardless of account existence.
  return ok({ message: "If that account exists, a reset code was sent." });
});
