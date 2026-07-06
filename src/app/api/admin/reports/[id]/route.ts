import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireRole } from "@/lib/auth/guards";
import { auditAdmin } from "@/lib/auth/admin";
import { z } from "zod";

export const runtime = "nodejs";

const resolveSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
  removeContent: z.boolean().optional(),
});

/** Resolve/dismiss a report, optionally removing the reported content. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await ctx.params;
  const { status, removeContent } = resolveSchema.parse(await req.json());

  const report = await db.report.findUnique({ where: { id } });
  if (!report) throw new ApiError("NOT_FOUND", "Report not found.");

  await db.report.update({
    where: { id },
    data: { status, resolvedById: admin.id },
  });

  if (removeContent) {
    if (report.targetType === "POST") {
      await db.post.update({ where: { id: report.targetId }, data: { deletedAt: new Date() } }).catch(() => {});
    } else if (report.targetType === "COMMENT") {
      await db.comment.update({ where: { id: report.targetId }, data: { deletedAt: new Date() } }).catch(() => {});
    }
  }

  await auditAdmin(admin.id, "SETTINGS_UPDATED", `report ${status}${removeContent ? " + removed content" : ""}`);
  return ok({ done: true });
});
