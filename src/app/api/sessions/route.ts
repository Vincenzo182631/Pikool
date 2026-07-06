import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { REFRESH_COOKIE } from "@/lib/auth/session";
import { verifyRefreshToken } from "@/lib/auth/jwt";

export const runtime = "nodejs";

/** List the current user's active sessions (devices), marking the current one. */
export const GET = route(async () => {
  const user = await requireUser();
  const jar = await cookies();
  const token = jar.get(REFRESH_COOKIE)?.value;
  const claims = token ? await verifyRefreshToken(token) : null;
  const currentSid = claims?.sid;

  const sessions = await db.session.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, userAgent: true, ip: true, createdAt: true, expiresAt: true },
  });

  return ok(
    sessions.map((s) => ({ ...s, current: s.id === currentSid })),
  );
});
