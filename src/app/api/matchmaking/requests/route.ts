import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { createRequestSchema } from "@/lib/validation/matchmaking";
import { serializeRequest } from "@/lib/services/matchmaking";
import { createNotification } from "@/lib/services/notification";

export const runtime = "nodejs";

const requestInclude = {
  fromUser: { include: { profile: true } },
  toUser: { include: { profile: true } },
  court: { select: { name: true } },
} as const;

/** My incoming and outgoing invites (pending + recently accepted). */
export const GET = route(async () => {
  const user = await requireUser();
  const statuses = ["PENDING", "ACCEPTED"] as const;

  const [incoming, outgoing] = await Promise.all([
    db.matchRequest.findMany({
      where: { toUserId: user.id, status: { in: [...statuses] } },
      include: requestInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.matchRequest.findMany({
      where: { fromUserId: user.id, status: { in: [...statuses] } },
      include: requestInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return ok({
    incoming: incoming.map((r) => serializeRequest(r, user.id)),
    outgoing: outgoing.map((r) => serializeRequest(r, user.id)),
  });
});

/** Send a play invite. */
export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const input = createRequestSchema.parse(await req.json());

  if (input.toUserId === user.id) throw new ApiError("VALIDATION_ERROR", "You can't invite yourself.");

  const target = await db.user.findUnique({
    where: { id: input.toUserId },
    select: { id: true, deletedAt: true, profile: { select: { username: true } } },
  });
  if (!target || target.deletedAt) throw new ApiError("NOT_FOUND", "That player isn't available.");

  // One pending invite per pair, in either direction.
  const existing = await db.matchRequest.findFirst({
    where: {
      status: "PENDING",
      OR: [
        { fromUserId: user.id, toUserId: input.toUserId },
        { fromUserId: input.toUserId, toUserId: user.id },
      ],
    },
    select: { id: true },
  });
  if (existing) throw new ApiError("CONFLICT", "You already have a pending invite with this player.");

  const created = await db.matchRequest.create({
    data: {
      fromUserId: user.id,
      toUserId: input.toUserId,
      format: input.format,
      courtId: input.courtId,
      message: input.message,
      proposedAt: input.proposedAt ? new Date(input.proposedAt) : null,
    },
    include: requestInclude,
  });

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.profile?.displayName || "A player";
  await createNotification({
    userId: input.toUserId,
    type: "GAME_INVITE",
    title: `${name} invited you to play`,
    body: input.message?.trim() || `${input.format.toLowerCase()} — respond in Matchmaking.`,
    data: { requestId: created.id, fromUserId: user.id },
  });

  return ok({ request: serializeRequest(created, user.id) });
});
