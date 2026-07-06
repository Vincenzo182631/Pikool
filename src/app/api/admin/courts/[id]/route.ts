import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireRole } from "@/lib/auth/guards";
import { auditAdmin } from "@/lib/auth/admin";
import { z } from "zod";

export const runtime = "nodejs";

const patchSchema = z.object({ verified: z.boolean() });

/** Verify / unverify a court. */
export const PATCH = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await ctx.params;
  const { verified } = patchSchema.parse(await req.json());

  const court = await db.court.findUnique({ where: { id }, select: { name: true } });
  if (!court) throw new ApiError("NOT_FOUND", "Court not found.");

  await db.court.update({ where: { id }, data: { verified } });
  await auditAdmin(admin.id, "SETTINGS_UPDATED", `${verified ? "verified" : "unverified"} court ${court.name}`);
  return ok({ verified });
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
