import "server-only";
import { db } from "@/lib/db";
import type { NotificationType, Prisma } from "@prisma/client";

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  /** Arbitrary payload used to build the click-through link (e.g. { requestId }). */
  data?: Prisma.InputJsonValue;
}

/**
 * Create a single notification. Best-effort — a notification failure must never
 * break the action that triggered it, so we log and swallow.
 */
export async function createNotification(input: NotificationInput) {
  try {
    return await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      },
    });
  } catch (err) {
    console.error("[notification] create failed:", err);
    return null;
  }
}

/**
 * Fan a notification out to many recipients at once (e.g. broadcasting an
 * "available to play" signal to nearby players). De-dupes ids, skips `exclude`
 * (usually the sender), and returns how many were created.
 */
export async function notifyMany(
  userIds: string[],
  input: Omit<NotificationInput, "userId"> & { exclude?: string },
): Promise<number> {
  const targets = [...new Set(userIds)].filter((id) => id && id !== input.exclude);
  if (targets.length === 0) return 0;
  try {
    const res = await db.notification.createMany({
      data: targets.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      })),
    });
    return res.count;
  } catch (err) {
    console.error("[notification] createMany failed:", err);
    return 0;
  }
}
