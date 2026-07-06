import "server-only";
import type { Prisma } from "@prisma/client";
import { initials } from "@/lib/utils";
import { SKILL_LEVELS } from "@/lib/validation/user";
import { distanceMeters, boundingBox, formatDistance } from "@/lib/services/court";
import type { AvailablePlayer, MatchRequestItem, RequestParty } from "@/types/matchmaking";

export { distanceMeters, boundingBox, formatDistance };

/** How far in the future an availability signal is allowed to sit (safety cap). */
export const AVAILABILITY_MAX_MS = 12 * 60 * 60 * 1000;

/** Rank of a skill level (index in the ascending ladder), or -1 if unknown. */
export function skillRank(level: string): number {
  return (SKILL_LEVELS as readonly string[]).indexOf(level);
}

type SignalWithUser = Prisma.AvailabilitySignalGetPayload<{
  include: { user: { include: { profile: true } } };
}>;

export function serializeAvailablePlayer(
  signal: SignalWithUser,
  viewer: { lat: number; lng: number },
  request: { status: "sent" | "incoming"; id: string } | null,
): AvailablePlayer {
  const u = signal.user;
  const p = u.profile;
  const distanceM = distanceMeters(viewer, { lat: signal.lat, lng: signal.lng });
  return {
    userId: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(" ") || p?.displayName || "Player",
    username: p?.username ?? null,
    avatarUrl: p?.avatarUrl ?? null,
    initials: initials(u.firstName, u.lastName),
    skillLevel: p?.skillLevel ?? "L2_5",
    ratingValue: p?.ratingValue ?? 2.5,
    city: p?.city ?? null,
    formats: p?.formats ?? [],
    format: signal.format,
    expiresAt: signal.expiresAt.toISOString(),
    distanceM,
    distanceLabel: formatDistance(distanceM),
    requestStatus: request?.status ?? "none",
    requestId: request?.id ?? null,
  };
}

type RequestWithParties = Prisma.MatchRequestGetPayload<{
  include: {
    fromUser: { include: { profile: true } };
    toUser: { include: { profile: true } };
    court: { select: { name: true } };
  };
}>;

function party(u: RequestWithParties["fromUser"]): RequestParty {
  return {
    userId: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.profile?.displayName || "Player",
    username: u.profile?.username ?? null,
    avatarUrl: u.profile?.avatarUrl ?? null,
    initials: initials(u.firstName, u.lastName),
    skillLevel: u.profile?.skillLevel ?? "L2_5",
  };
}

export function serializeRequest(req: RequestWithParties, viewerId: string): MatchRequestItem {
  const direction: "incoming" | "outgoing" = req.toUserId === viewerId ? "incoming" : "outgoing";
  const other = direction === "incoming" ? req.fromUser : req.toUser;
  return {
    id: req.id,
    status: req.status,
    format: req.format,
    message: req.message,
    proposedAt: req.proposedAt?.toISOString() ?? null,
    courtName: req.court?.name ?? null,
    createdAt: req.createdAt.toISOString(),
    direction,
    party: party(other),
  };
}
