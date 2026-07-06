import { ok, route } from "@/lib/api";
import { destroySession, getCurrentUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";

export const POST = route(async () => {
  const user = await getCurrentUser();
  if (user) await logActivity({ userId: user.id, type: "LOGOUT" });
  await destroySession();
  return ok({ loggedOut: true });
});
