import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireRole } from "@/lib/auth/guards";
import { auditAdmin } from "@/lib/auth/admin";
import { z } from "zod";

export const runtime = "nodejs";

const actionSchema = z.object({
  action: z.enum(["suspend", "restore", "grantAdmin", "revokeAdmin", "purge"]),
});

export const PATCH = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await ctx.params;
  const { action } = actionSchema.parse(await req.json());

  if (id === admin.id && (action === "suspend" || action === "revokeAdmin" || action === "purge")) {
    throw new ApiError("FORBIDDEN", "You can't do that to your own account.");
  }

  const target = await db.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!target) throw new ApiError("NOT_FOUND", "User not found.");

  switch (action) {
    case "suspend":
      await db.$transaction([
        db.user.update({ where: { id }, data: { deletedAt: new Date() } }),
        db.session.deleteMany({ where: { userId: id } }),
      ]);
      break;
    case "restore":
      await db.user.update({ where: { id }, data: { deletedAt: null } });
      break;
    case "grantAdmin":
      await db.userRole.upsert({
        where: { userId_role: { userId: id, role: "ADMIN" } },
        update: {},
        create: { userId: id, role: "ADMIN" },
      });
      break;
    case "revokeAdmin":
      await db.userRole.deleteMany({ where: { userId: id, role: "ADMIN" } });
      break;
    case "purge":
      await db.user.delete({ where: { id } }); // cascades
      break;
  }

  await auditAdmin(admin.id, action === "grantAdmin" ? "ROLE_GRANTED" : "SETTINGS_UPDATED", `${action} ${target.email}`);
  return ok({ done: true });
});
