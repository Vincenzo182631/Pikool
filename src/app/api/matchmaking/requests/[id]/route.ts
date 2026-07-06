import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { respondRequestSchema } from "@/lib/validation/matchmaking";
import { serializeRequest } from "@/lib/services/matchmaking";
import { createNotification } from "@/lib/services/notification";

export const runtime = "nodejs";

const requestInclude = {
  fromUser: { include: { profile: true } },
  toUser: { include: { profile: true } },
  court: { select: { name: true } },
} as const;

/** Accept, decline, or cancel a play invite. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const { action } = respondRequestSchema.parse(await req.json());

  const request = await db.matchRequest.findUnique({ where: { id }, include: requestInclude });
  if (!request) throw new ApiError("NOT_FOUND", "Invite not found.");
  if (request.status !== "PENDING") throw new ApiError("CONFLICT", "This invite has already been handled.");

  const isRecipient = request.toUserId === user.id;
  const isSender = request.fromUserId === user.id;
  if ((action === "accept" || action === "decline") && !isRecipient) {
    throw new ApiError("FORBIDDEN", "Only the invited player can respond.");
  }
  if (action === "cancel" && !isSender) {
    throw new ApiError("FORBIDDEN", "Only the sender can cancel.");
  }

  const status = action === "accept" ? "ACCEPTED" : action === "decline" ? "DECLINED" : "CANCELLED";
  const updated = await db.matchRequest.update({
    where: { id },
    data: { status, respondedAt: new Date() },
    include: requestInclude,
  });

  const me = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.profile?.displayName || "A player";
  if (action === "accept") {
    await createNotification({
      userId: request.fromUserId,
      type: "GAME_INVITE",
      title: `${me} accepted your invite`,
      body: `You're on for ${request.format.toLowerCase()} — message them to lock in the details.`,
      data: { requestId: id, userId: user.id },
    });
  } else if (action === "decline") {
    await createNotification({
      userId: request.fromUserId,
      type: "GAME_INVITE",
      title: `${me} can't play right now`,
      body: "Your invite was declined — try another player nearby.",
      data: { requestId: id, userId: user.id },
    });
  } else {
    await createNotification({
      userId: request.toUserId,
      type: "GAME_INVITE",
      title: `${me} cancelled an invite`,
      body: "The play invite was withdrawn.",
      data: { requestId: id, userId: user.id },
    });
  }

  return ok({ request: serializeRequest(updated, user.id) });
});
