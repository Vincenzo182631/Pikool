import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";

const accessSecret = new TextEncoder().encode(env.jwtAccessSecret);
const refreshSecret = new TextEncoder().encode(env.jwtRefreshSecret);

export const ACCESS_TTL = "15m";
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface AccessClaims extends JWTPayload {
  sub: string;
  roles: string[];
  emailVerified: boolean;
}

export interface RefreshClaims extends JWTPayload {
  sub: string;
  sid: string; // session id
}

export async function signAccessToken(claims: {
  userId: string;
  roles: string[];
  emailVerified: boolean;
}): Promise<string> {
  return new SignJWT({ roles: claims.roles, emailVerified: claims.emailVerified })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(accessSecret);
}

export async function signRefreshToken(claims: {
  userId: string;
  sessionId: string;
}): Promise<string> {
  return new SignJWT({ sid: claims.sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_SECONDS}s`)
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return payload as AccessClaims;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload as RefreshClaims;
  } catch {
    return null;
  }
}
