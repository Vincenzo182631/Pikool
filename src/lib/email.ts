import { env } from "@/lib/env";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a transactional email. Uses Resend when RESEND_API_KEY is set; otherwise
 * logs to the console so local dev works with no email provider (see docs/17).
 */
export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!env.resendApiKey) {
    console.log(
      `\n[email:dev] To: ${to}\n[email:dev] Subject: ${subject}\n[email:dev] ${text ?? html}\n`,
    );
    return { delivered: false as const, dev: true as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.emailFrom, to, subject, html, text }),
  });

  if (!res.ok) {
    console.error("[email] Resend error:", await res.text());
    throw new Error("Failed to send email");
  }
  return { delivered: true as const };
}

export function otpEmail(code: string) {
  return {
    subject: "Your PicklePlay verification code",
    text: `Your PicklePlay verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#039855;font-size:20px">PicklePlay</h1>
        <p>Your verification code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0c111d">${code}</p>
        <p style="color:#5b6472;font-size:14px">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
      </div>`,
  };
}
