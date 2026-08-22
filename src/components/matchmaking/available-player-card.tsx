"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Send, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingBadge } from "@/components/ui/rating-badge";
import { ApiClientError } from "@/lib/api-client";
import { useSendInvite } from "@/hooks/use-matchmaking";
import type { AvailablePlayer } from "@/types/matchmaking";

const FORMAT_LABEL: Record<string, string> = { SINGLES: "Singles", DOUBLES: "Doubles", MIXED: "Mixed" };

export function AvailablePlayerCard({ player }: { player: AvailablePlayer }) {
  const invite = useSendInvite();

  function onInvite() {
    invite.mutate(
      { toUserId: player.userId, format: player.format as "SINGLES" | "DOUBLES" | "MIXED" },
      {
        onSuccess: () => toast.success(`Invite sent to ${player.name.split(" ")[0]}`),
        onError: (err) =>
          toast.error(err instanceof ApiClientError ? err.message : "Couldn't send invite."),
      },
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-3xl bg-card shadow-card p-4">
      <Link href={player.username ? `/players/${player.username}` : "#"} className="shrink-0">
        <Avatar src={player.avatarUrl} fallback={player.initials} size={48} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {player.username ? (
            <Link href={`/players/${player.username}`} className="font-semibold hover:underline">
              {player.name}
            </Link>
          ) : (
            <span className="font-semibold">{player.name}</span>
          )}
          <RatingBadge level={player.skillLevel} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {player.distanceLabel} away
            {player.city ? ` · ${player.city}` : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> until {formatDistanceToNow(new Date(player.expiresAt), { addSuffix: true })}
          </span>
        </div>
        <div className="mt-2">
          <Badge variant="secondary">Wants {FORMAT_LABEL[player.format] ?? player.format}</Badge>
        </div>
      </div>

      <div className="shrink-0">
        {player.requestStatus === "sent" ? (
          <Button size="sm" variant="outline" disabled>
            <Check /> Invited
          </Button>
        ) : player.requestStatus === "incoming" ? (
          <Button asChild size="sm" variant="secondary">
            <Link href="#requests">Respond</Link>
          </Button>
        ) : (
          <Button size="sm" onClick={onInvite} loading={invite.isPending}>
            <Send /> Invite
          </Button>
        )}
      </div>
    </div>
  );
}
