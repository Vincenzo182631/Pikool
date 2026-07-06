import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireRole } from "@/lib/auth/guards";
import { auditAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";

const schema = z.object({
  targetType: z.string(),
  targetId: z.string(),
  action: z.enum(["remove", "resolve", "dismiss"]),
});

/**
 * Resolve every open report for a single target at once (grouped moderation),
 * optionally removing the reported content.
 */
export const POST = route(async (req: Request) => {
  const admin = await requireRole("ADMIN");
  const { targetType, targetId, action } = schema.parse(await req.json());

  if (action === "remove") {
    if (targetType === "POST") {
      await db.post.update({ where: { id: targetId }, data: { deletedAt: new Date() } }).catch(() => {});
    } else if (targetType === "COMMENT") {
      await db.comment.update({ where: { id: targetId }, data: { deletedAt: new Date() } }).catch(() => {});
    } else if (targetType === "USER") {
      await db.user.update({ where: { id: targetId }, data: { deletedAt: new Date() } }).catch(() => {});
      await db.session.deleteMany({ where: { userId: targetId } });
    }
  }

  const status = action === "dismiss" ? "DISMISSED" : "RESOLVED";
  const res = await db.report.updateMany({
    where: { targetType, targetId, status: { in: ["OPEN", "REVIEWING"] } },
    data: { status, resolvedById: admin.id },
  });
  if (res.count === 0) throw new ApiError("NOT_FOUND", "No open reports for this target.");

  await auditAdmin(
    admin.id,
    "SETTINGS_UPDATED",
    `${action} ${targetType} ${targetId} (${res.count} report${res.count === 1 ? "" : "s"})`,
  );
  return ok({ done: true, affected: res.count });
});
