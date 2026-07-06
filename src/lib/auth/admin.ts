import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import type { ActivityType, Prisma } from "@prisma/client";

/** Page-level admin gate: redirect non-admins away from /admin. */
export async function getAdminOrRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  const isAdmin = user.roles.some((r) => r.role === "ADMIN");
  if (!isAdmin) redirect("/dashboard");
  return user;
}

/** Write an audit entry for an admin action (kept in ActivityLog). */
export function auditAdmin(
  adminId: string,
  type: ActivityType,
  message: string,
  meta?: Prisma.InputJsonValue,
) {
  return logActivity({ userId: adminId, type, message: `[admin] ${message}`, meta });
}
