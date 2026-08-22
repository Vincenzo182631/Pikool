"use client";

import * as React from "react";
import { Users, SlidersHorizontal, MapPinOff } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { PLAY_FORMATS, SKILL_LEVELS } from "@/lib/validation/user";
import { SKILL_META } from "@/lib/constants";
import { usePlayers, useRequests, useMyAvailability } from "@/hooks/use-matchmaking";
import { BroadcastPanel } from "@/components/matchmaking/broadcast-panel";
import { RequestsPanel } from "@/components/matchmaking/requests-panel";
import { AvailablePlayerCard } from "@/components/matchmaking/available-player-card";
import { SeasonStats } from "@/components/matchmaking/season-stats";

const FORMAT_LABEL: Record<string, string> = { SINGLES: "Singles", DOUBLES: "Doubles", MIXED: "Mixed" };
const selectClass =
  "h-9 rounded-2xl border border-border/60 bg-secondary/60 px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MatchmakingClient({
  stats,
}: {
  stats: { matches: number; wins: number; rating: number | null };
}) {
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = React.useState(false);
  const [format, setFormat] = React.useState("");
  const [minSkill, setMinSkill] = React.useState("");
  const [maxSkill, setMaxSkill] = React.useState("");
  const [radiusKm, setRadiusKm] = React.useState(25);

  function locate() {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't available in your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error("Couldn't get your location. Enable location access and try again.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const query = React.useMemo(() => {
    if (!coords) return null;
    const p = new URLSearchParams();
    p.set("lat", String(coords.lat));
    p.set("lng", String(coords.lng));
    p.set("radiusKm", String(radiusKm));
    if (format) p.set("format", format);
    if (minSkill) p.set("minSkill", minSkill);
    if (maxSkill) p.set("maxSkill", maxSkill);
    return p.toString();
  }, [coords, radiusKm, format, minSkill, maxSkill]);

  const { data: playersData, isLoading } = usePlayers(query);
  const { data: availData } = useMyAvailability();
  useRequests(); // warm the cache so the requests panel is ready

  const players = playersData?.players ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="This season" title="My Matches" />

      <div className="space-y-5">
        <SeasonStats matches={stats.matches} wins={stats.wins} rating={stats.rating} />

        <BroadcastPanel
          coords={coords}
          locating={locating}
          onLocate={locate}
          myAvailability={availData?.availability ?? null}
        />

        <RequestsPanel />

        {/* Nearby players */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display flex items-center gap-2 text-[22px] font-bold text-ink">
              <IconTile icon={Users} tone="gray" size="sm" /> Available nearby
            </h2>
          </div>

          {/* Filters */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-3.5" /> Filter
            </span>
            <select className={selectClass} value={format} onChange={(e) => setFormat(e.target.value)} aria-label="Format">
              <option value="">Any format</option>
              {PLAY_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABEL[f]}
                </option>
              ))}
            </select>
            <select className={selectClass} value={minSkill} onChange={(e) => setMinSkill(e.target.value)} aria-label="Minimum skill">
              <option value="">Min skill</option>
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {SKILL_META[l]?.value} min
                </option>
              ))}
            </select>
            <select className={selectClass} value={maxSkill} onChange={(e) => setMaxSkill(e.target.value)} aria-label="Maximum skill">
              <option value="">Max skill</option>
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {SKILL_META[l]?.value} max
                </option>
              ))}
            </select>
            <select className={selectClass} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} aria-label="Radius">
              {[10, 25, 50, 100].map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
          </div>

          {!coords ? (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center">
              <IconTile icon={MapPinOff} tone="gray" size="lg" className="mx-auto mb-3" />
              <p className="font-medium">Share your location to find players</p>
              <p className="mb-4 text-sm text-muted-foreground">We&apos;ll show available players closest to you first.</p>
              <Button onClick={locate} loading={locating}>
                Use my location
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center">
              <IconTile icon={Users} tone="gray" size="lg" className="mx-auto mb-3" />
              <p className="font-medium">No one&apos;s available right now</p>
              <p className="text-sm text-muted-foreground">
                Broadcast your own availability above — nearby players get notified when you do.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {players.map((p) => (
                <AvailablePlayerCard key={p.userId} player={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
