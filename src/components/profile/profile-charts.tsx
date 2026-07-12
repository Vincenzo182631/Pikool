"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LineChart } from "lucide-react";
import type { PlayerProfileData } from "@/types/player-profile";

type Series = PlayerProfileData["ratingSeries"];

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-secondary/40 text-center clay-inset">
      <LineChart className="size-6 text-muted-foreground/60" />
      <p className="max-w-[22ch] text-xs text-muted-foreground">
        {label} appears here once matches are recorded.
      </p>
    </div>
  );
}

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-card/70 p-4 glass clay-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

/** Smooth-ish area+line for the rating trajectory. */
function RatingProgress({ series }: { series: Series }) {
  if (series.length < 2) return <EmptyChart label="Your rating progress" />;
  const w = 320;
  const h = 140;
  const pad = 10;
  const vals = series.map((p) => p.v);
  const min = Math.min(...vals) - 0.1;
  const max = Math.max(...vals) + 0.1;
  const x = (i: number) => pad + (i / (series.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
  const line = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${h - pad} L${x(0).toFixed(1)},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Rating progress over time">
      <defs>
        <linearGradient id="rp-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand-500)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--brand-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#rp-fill)" />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--brand-500)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <circle cx={x(series.length - 1)} cy={y(series[series.length - 1]!.v)} r="4" fill="var(--brand-500)" />
    </svg>
  );
}

/** Monthly game volume as bars, derived from match timestamps. */
function MonthlyGames({ series }: { series: Series }) {
  const buckets = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of series) {
      const d = new Date(p.t);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].slice(-6);
  }, [series]);

  if (buckets.length === 0) return <EmptyChart label="Games per month" />;
  const max = Math.max(...buckets.map(([, n]) => n), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {buckets.map(([key, n], i) => {
        const label = new Date(`${key}-01`).toLocaleDateString(undefined, { month: "short" });
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
            <motion.div
              className="w-full rounded-t-lg"
              style={{ background: "linear-gradient(180deg, #ffc66d, var(--brand-500))" }}
              initial={{ height: 0 }}
              animate={{ height: `${(n / max) * 100}%` }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 20 }}
              title={`${n} game${n === 1 ? "" : "s"}`}
            />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Rolling win-rate line (share of recent matches won). */
function WinRateTrend({ series }: { series: Series }) {
  if (series.length < 3) return <EmptyChart label="Your win-rate trend" />;
  const w = 320;
  const h = 140;
  const pad = 10;
  const win = 5; // rolling window
  const pts = series.map((_, i) => {
    const from = Math.max(0, i - win + 1);
    const slice = series.slice(from, i + 1);
    const wins = slice.filter((p) => p.win).length;
    return (wins / slice.length) * 100;
  });
  const x = (i: number) => pad + (i / (pts.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - v / 100) * (h - pad * 2);
  const line = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Win-rate trend">
      <line x1={pad} y1={y(50)} x2={w - pad} y2={y(50)} stroke="var(--border)" strokeDasharray="4 4" />
      <motion.path
        d={line}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

export function ProfileCharts({ data }: { data: PlayerProfileData }) {
  const s = data.ratingSeries;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ChartFrame title="Rating progress">
        <RatingProgress series={s} />
      </ChartFrame>
      <ChartFrame title="Monthly games">
        <MonthlyGames series={s} />
      </ChartFrame>
      <ChartFrame title="Win-rate trend">
        <WinRateTrend series={s} />
      </ChartFrame>
      <ChartFrame title="Rating summary">
        <div className="grid h-40 grid-cols-2 place-content-center gap-4 text-center">
          <div>
            <p className="text-3xl font-bold tabular-nums text-[var(--brand-500)]">{data.ratingLabel}</p>
            <p className="text-xs text-muted-foreground">Current · {data.levelLabel}</p>
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums">{data.stats.winPct}%</p>
            <p className="text-xs text-muted-foreground">Career win rate</p>
          </div>
        </div>
      </ChartFrame>
    </div>
  );
}
