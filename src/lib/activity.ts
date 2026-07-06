import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { ActivityType, Prisma } from "@prisma/client";

/**
 * Record a user activity for the audit trail and the dashboard "recent
 * activity" feed. Best-effort: never throws into the calling request path.
 */
export async function logActivity(input: {
  userId: string;
  type: ActivityType;
  message?: string;
  meta?: Prisma.InputJsonValue;
}) {
  try {
    const hdrs = await headers();
    await db.activityLog.create({
      data: {
        userId: input.userId,
        type: input.type,
        message: input.message,
        meta: input.meta,
        ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: hdrs.get("user-agent") ?? undefined,
      },
    });
  } catch (err) {
    console.error("[activity] Failed to log activity:", err);
  }
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  REGISTER: "Created your account",
  LOGIN: "Signed in",
  LOGOUT: "Signed out",
  EMAIL_VERIFIED: "Verified your email",
  PROFILE_UPDATED: "Updated your profile",
  PASSWORD_CHANGED: "Changed your password",
  EMAIL_CHANGED: "Changed your email",
  SETTINGS_UPDATED: "Updated your settings",
  ROLE_GRANTED: "Was granted a new role",
  ACCOUNT_DELETED: "Deleted your account",
};

export function activityLabel(type: ActivityType, message?: string | null) {
  return message ?? ACTIVITY_LABELS[type] ?? "Activity";
}
