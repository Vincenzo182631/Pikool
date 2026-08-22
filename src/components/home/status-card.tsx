"use client";

import * as React from "react";
import { CalendarDays, Trophy, Zap } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";

const TABS = ["Upcoming", "Match"] as const;

/**
 * The two-tile status card on Home. Left tile is accent (live court supply),
 * right tile is neutral (the player's next commitment).
 */
export function StatusCard({
  courtsAvailable,
  nextMatchLabel,
}: {
  courtsAvailable: number;
  nextMatchLabel: string;
}) {
  const [tab, setTab] = React.useState<(typeof TABS)[number]>("Upcoming");

  return (
    <div className="rounded-[20px] bg-card px-4 pt-3.5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-[26px] place-items-center rounded-full bg-ink text-white">
            <Zap className="size-[13px]" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold text-ink">{tab}</span>
        </div>
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 pb-3.5">
        <StatusTile
          tone="accent"
          value={String(courtsAvailable)}
          label={<>Court<br />Available</>}
          icon={CalendarDays}
        />
        <StatusTile
          tone="neutral"
          value={nextMatchLabel}
          label={<>Next<br />Match</>}
          icon={Trophy}
        />
      </div>
    </div>
  );
}

function StatusTile({
  tone,
  value,
  label,
  icon: Icon,
}: {
  tone: "accent" | "neutral";
  value: string;
  label: React.ReactNode;
  icon: typeof Trophy;
}) {
  return (
    <div
      className={`relative min-h-[88px] overflow-hidden rounded-2xl p-3.5 ${
        tone === "accent" ? "tile-accent" : "tile-neutral"
      }`}
    >
      <p className="font-display text-[30px] font-extrabold leading-none text-ink">{value}</p>
      <p className="mt-1 text-[11px] font-medium leading-tight text-ink">{label}</p>
      <span
        className={`absolute bottom-2.5 right-2.5 grid size-[30px] place-items-center rounded-full bg-ink ${
          tone === "accent" ? "text-primary" : "text-white"
        }`}
      >
        <Icon className="size-3.5" strokeWidth={1.8} />
      </span>
    </div>
  );
}
