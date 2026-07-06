import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

/** Export the user's data as a downloadable JSON file (GDPR-style). */
export const GET = route(async () => {
  const user = await requireUser();
  const data = await db.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      settings: true,
      roles: true,
      badges: { include: { badge: true } },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 500 },
      notifications: { orderBy: { createdAt: "desc" }, take: 500 },
    },
  });

  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), user: data },
    null,
    2,
  );

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pikool-data-${user.id}.json"`,
    },
  });
});
