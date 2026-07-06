/**
 * Centralized environment access. Non-secret defaults keep the app buildable
 * and runnable in dev; production must supply real values (see docs/17).
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Do not throw at import time (would break `next build`); warn instead.
    if (process.env.NODE_ENV === "production") {
      console.warn(`[env] Missing required environment variable: ${name}`);
    }
    return "";
  }
  return value;
}

export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",

  databaseUrl: required("DATABASE_URL"),

  jwtAccessSecret: required(
    "JWT_ACCESS_SECRET",
    "dev-access-secret-change-me-at-least-32-chars-long-000",
  ),
  jwtRefreshSecret: required(
    "JWT_REFRESH_SECRET",
    "dev-refresh-secret-change-me-at-least-32-chars-long-0",
  ),

  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "PicklePlay <noreply@pickleplay.app>",

  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",

  googleMapsBrowserKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ?? "",
} as const;
