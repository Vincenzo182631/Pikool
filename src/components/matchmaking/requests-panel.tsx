"use client";

import * as React from "react";
import Link from "next/link";
import { Inbox, Send as SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingBadge } from "@/components/ui/rating-badge";
import { ApiClientError } from "@/lib/api-client";
import { useRequests, useRespondInvite } from "@/hooks/use-matchmaking";
import type { MatchRequestItem } from "@/types/matchmaking";

const FORMAT_LABEL: Record<string, string> = { SINGLES: "Singles", DOUBLES: "Doubles", MIXED: "Mixed" };

function StatusBadge({ status }: { status: string }) {
  if (status === "ACCEPTED") return <Badge variant="accent">Accepted</Badge>;
  if (status === "PENDING") return <Badge variant="secondary">Pending</Badge>;
  return <Badge variant="outline">{status.toLowerCase()}</Badge>;
}

function RequestRow({ req }: { req: MatchRequestItem }) {
  const respond = useRespondInvite();
  const first = req.party.name.split(" ")[0];

  function act(action: "accept" | "decline" | "cancel") {
    respond.mutate(
      { id: req.id, action },
      {
        onSuccess: () =>
          toast.success(
            action === "accept" ? `You're on with ${first}!` : action === "decline" ? "Invite declined" : "Invite cancelled",
          ),
        onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Action failed."),
      },
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-3xl bg-card clay p-3">
      <Link href={req.party.username ? `/players/${req.party.username}` : "#"} className="shrink-0">
        <Avatar src={req.party.avatarUrl} fallback={req.party.initials} size={40} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {req.party.username ? (
            <Link href={`/players/${req.party.username}`} className="text-sm font-semibold hover:underline">
              {req.party.name}
            </Link>
          ) : (
            <span className="text-sm font-semibold">{req.party.name}</span>
          )}
          <RatingBadge level={req.party.skillLevel} />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {FORMAT_LABEL[req.format] ?? req.format}
          {req.courtName ? ` · ${req.courtName}` : ""}
          {req.message ? ` · “${req.message}”` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {req.status === "ACCEPTED" ? (
          <StatusBadge status={req.status} />
        ) : req.direction === "incoming" ? (
          <>
            <Button size="sm" onClick={() => act("accept")} loading={respond.isPending}>
              Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={() => act("decline")} disabled={respond.isPending}>
              Decline
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => act("cancel")} loading={respond.isPending}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function RequestsPanel() {
  const { data } = useRequests();
  const incoming = data?.incoming ?? [];
  const outgoing = data?.outgoing ?? [];

  if (incoming.length === 0 && outgoing.length === 0) return null;

  return (
    <div id="requests" className="space-y-4 scroll-mt-20">
      {incoming.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Inbox className="size-4 text-primary" /> Invites for you
            <Badge variant="secondary">{incoming.length}</Badge>
          </h2>
          <div className="space-y-2">
            {incoming.map((r) => (
              <RequestRow key={r.id} req={r} />
            ))}
          </div>
        </section>
      )}

      {outgoing.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <SendIcon className="size-4 text-muted-foreground" /> Invites you sent
          </h2>
          <div className="space-y-2">
            {outgoing.map((r) => (
              <RequestRow key={r.id} req={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
