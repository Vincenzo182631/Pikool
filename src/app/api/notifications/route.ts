import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

/** List the current user's notifications (most recent first). */
export const GET = route(async (req: Request) => {
  const user = await requireUser();
  const unreadOnly = new URL(req.url).searchParams.get("unread") === "true";

  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return ok({ items, unreadCount });
});

/** Mark notifications read (specific ids, or all). */
export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const body = (await req.json().catch(() => ({}))) as { ids?: string[]; all?: boolean };

  await db.notification.updateMany({
    where: {
      userId: user.id,
      readAt: null,
      ...(body.all ? {} : { id: { in: body.ids ?? [] } }),
    },
    data: { readAt: new Date() },
  });

  return ok({ ok: true });
});
