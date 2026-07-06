import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { logActivity } from "@/lib/activity";
import { updateSettingsSchema } from "@/lib/validation/settings";

export const runtime = "nodejs";

export const GET = route(async () => {
  const user = await requireUser();
  const settings = await db.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  return ok(settings);
});

export const PATCH = route(async (req: Request) => {
  const user = await requireUser();
  const input = updateSettingsSchema.parse(await req.json());

  const settings = await db.userSettings.upsert({
    where: { userId: user.id },
    update: input,
    create: { userId: user.id, ...input },
  });

  await logActivity({ userId: user.id, type: "SETTINGS_UPDATED" });
  return ok(settings);
});
