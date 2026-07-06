import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireRole } from "@/lib/auth/guards";
import { auditAdmin } from "@/lib/auth/admin";
import { adminUpdateCourtSchema } from "@/lib/validation/court";

export const runtime = "nodejs";

/** Edit a court — verify/unverify inline, or update any field from the admin editor. */
export const PATCH = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await ctx.params;
  const input = adminUpdateCourtSchema.parse(await req.json());
  if (Object.keys(input).length === 0) throw new ApiError("VALIDATION_ERROR", "No changes provided.");

  const court = await db.court.findUnique({ where: { id }, select: { name: true } });
  if (!court) throw new ApiError("NOT_FOUND", "Court not found.");

  await db.court.update({ where: { id }, data: input });

  // A lone verify toggle reads better in the audit log than a generic "edited".
  const onlyVerify = "verified" in input && Object.keys(input).length === 1;
  const summary = onlyVerify
    ? `${input.verified ? "verified" : "unverified"} court ${court.name}`
    : `edited court ${court.name}`;
  await auditAdmin(admin.id, "SETTINGS_UPDATED", summary);
  return ok({ updated: true });
});

/** Delete a court. */
export const DELETE = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await ctx.params;
  const court = await db.court.findUnique({ where: { id }, select: { name: true } });
  if (!court) throw new ApiError("NOT_FOUND", "Court not found.");
  await db.court.delete({ where: { id } });
  await auditAdmin(admin.id, "SETTINGS_UPDATED", `deleted court ${court.name}`);
  return ok({ deleted: true });
});
