"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Radio, LocateFixed, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiClientError } from "@/lib/api-client";
import { PLAY_FORMATS } from "@/lib/validation/user";
import { useBroadcast, useStopBroadcast } from "@/hooks/use-matchmaking";
import { cn } from "@/lib/utils";
import type { MyAvailability } from "@/types/matchmaking";

const FORMAT_LABEL: Record<string, string> = { SINGLES: "Singles", DOUBLES: "Doubles", MIXED: "Mixed" };
const selectClass =
  "h-10 rounded-2xl border border-border/60 bg-secondary/60 clay-inset px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function BroadcastPanel({
  coords,
  locating,
  onLocate,
  myAvailability,
}: {
  coords: { lat: number; lng: number } | null;
  locating: boolean;
  onLocate: () => void;
  myAvailability: MyAvailability | null;
}) {
  const [format, setFormat] = React.useState("DOUBLES");
  const [radiusKm, setRadiusKm] = React.useState(15);
  const [durationMins, setDurationMins] = React.useState(180);
  const broadcast = useBroadcast();
  const stop = useStopBroadcast();

  function goLive() {
    if (!coords) {
      onLocate();
      return;
    }
    broadcast.mutate(
      { format: format as (typeof PLAY_FORMATS)[number], lat: coords.lat, lng: coords.lng, radiusKm, durationMins },
      {
        onSuccess: (res) =>
          toast.success(
            res.notified > 0
              ? `You're live — ${res.notified} nearby player${res.notified === 1 ? "" : "s"} notified`
              : "You're now visible to nearby players",
          ),
        onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Couldn't go available."),
      },
    );
  }

  function goOffline() {
    stop.mutate(undefined, {
      onSuccess: () => toast.success("You're no longer broadcasting"),
      onError: () => toast.error("Couldn't stop."),
    });
  }

  if (myAvailability) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/20" />
              <Radio className="size-5" />
            </span>
            <div>
              <p className="font-semibold">You&apos;re available to play</p>
              <p className="text-sm text-muted-foreground">
                {FORMAT_LABEL[myAvailability.format] ?? myAvailability.format} · ends{" "}
                {formatDistanceToNow(new Date(myAvailability.expiresAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={goOffline} loading={stop.isPending}>
            <X /> Stop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card clay p-5">
      <div className="mb-4 flex items-center gap-2">
        <Radio className="size-5 text-primary" />
        <h2 className="font-semibold">Broadcast that you&apos;re up for a game</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="bc-format">Format</Label>
          <select id="bc-format" className={cn(selectClass, "w-full")} value={format} onChange={(e) => setFormat(e.target.value)}>
            {PLAY_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABEL[f]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bc-radius">Within</Label>
          <select id="bc-radius" className={cn(selectClass, "w-full")} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))}>
            {[5, 10, 15, 25, 50].map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bc-duration">For</Label>
          <select id="bc-duration" className={cn(selectClass, "w-full")} value={durationMins} onChange={(e) => setDurationMins(Number(e.target.value))}>
            {[
              { v: 60, l: "1 hour" },
              { v: 120, l: "2 hours" },
              { v: 180, l: "3 hours" },
              { v: 360, l: "6 hours" },
            ].map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={goLive} loading={broadcast.isPending} size="lg" variant="cta">
          <Radio /> I&apos;m available
        </Button>
        <Button variant="outline" onClick={onLocate} loading={locating} disabled={broadcast.isPending}>
          {locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
          {coords ? "Location set" : "Use my location"}
        </Button>
        {!coords && <span className="text-xs text-muted-foreground">We need your location to match you nearby.</span>}
      </div>
    </div>
  );
}
