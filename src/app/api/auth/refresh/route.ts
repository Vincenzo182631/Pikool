import { ApiError, ok, route } from "@/lib/api";
import { rotateSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export const POST = route(async () => {
  const result = await rotateSession();
  if (!result) {
    throw new ApiError("UNAUTHENTICATED", "Session expired. Please sign in again.");
  }
  return ok({ refreshed: true });
});
