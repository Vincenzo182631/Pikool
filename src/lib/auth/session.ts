import { cookies, headers } from "next/headers";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  REFRESH_TTL_SECONDS,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

export const ACCESS_COOKIE = "pp_access";
export const REFRESH_COOKIE = "pp_refresh";
const ACCESS_MAX_AGE = 60 * 15; // 15 min

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

const baseCookie = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax" as const,
  path: "/",
};

/** Create a new session + set access/refresh cookies. Returns the tokens. */
export async function createSession(user: {
  id: string;
  roles: string[];
  emailVerified: boolean;
}) {
  const hdrs = await headers();
  const session = await db.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "", // filled after signing (needs session id)
      userAgent: hdrs.get("user-agent") ?? undefined,
      ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim(),
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    },
  });

  const refreshToken = await signRefreshToken({
    userId: user.id,
    sessionId: session.id,
  });
  await db.session.update({
    where: { id: session.id },
    data: { refreshTokenHash: sha256(refreshToken) },
  });

  const accessToken = await signAccessToken({
    userId: user.id,
    roles: user.roles,
    emailVerified: user.emailVerified,
  });

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  jar.set(REFRESH_COOKIE, refreshToken, { ...baseCookie, maxAge: REFRESH_TTL_SECONDS });

  return { accessToken, refreshToken };
}

/**
 * Rotate the current refresh token → new access + refresh. Detects reuse of a
 * rotated token and revokes the session family (see docs/09).
 */
export async function rotateSession() {
  const jar = await cookies();
  const token = jar.get(REFRESH_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifyRefreshToken(token);
  if (!claims?.sid) return null;

  const session = await db.session.findUnique({ where: { id: claims.sid } });
  if (!session || session.expiresAt < new Date()) return null;

  // Reuse detection: presented token doesn't match the stored (latest) hash.
  if (session.refreshTokenHash !== sha256(token)) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    await clearSessionCookies();
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { roles: true },
  });
  if (!user) return null;

  const newRefresh = await signRefreshToken({
    userId: user.id,
    sessionId: session.id,
  });
  await db.session.update({
    where: { id: session.id },
    data: { refreshTokenHash: sha256(newRefresh) },
  });
  const newAccess = await signAccessToken({
    userId: user.id,
    roles: user.roles.map((r) => r.role),
    emailVerified: Boolean(user.emailVerified),
  });

  jar.set(ACCESS_COOKIE, newAccess, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  jar.set(REFRESH_COOKIE, newRefresh, { ...baseCookie, maxAge: REFRESH_TTL_SECONDS });
  return { userId: user.id };
}

/** Revoke the current session and clear cookies. */
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(REFRESH_COOKIE)?.value;
  if (token) {
    const claims = await verifyRefreshToken(token);
    if (claims?.sid) {
      await db.session.delete({ where: { id: claims.sid } }).catch(() => {});
    }
  }
  await clearSessionCookies();
}

export async function clearSessionCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

/**
 * Resolve the current authenticated user from the access cookie. Returns null
 * when unauthenticated. Does not auto-refresh (route handlers call
 * rotateSession explicitly on 401 from the client).
 */
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifyAccessToken(token);
  if (!claims?.sub) return null;

  const user = await db.user.findUnique({
    where: { id: claims.sub },
    include: { profile: true, roles: true },
  });
  if (!user || user.deletedAt) return null;
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
