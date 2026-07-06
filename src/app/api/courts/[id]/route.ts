import { ApiError, ok, route } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourtDetail } from "@/lib/services/court-detail";

export const runtime = "nodejs";

export const GET = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const court = await getCourtDetail(id, user?.id);
  if (!court) throw new ApiError("NOT_FOUND", "Court not found.");
  return ok(court);
});
