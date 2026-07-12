"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Flame,
  Gamepad2,
  Heart,
  Medal,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerProfileData } from "@/types/player-profile";

interface CardDef {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "gold" | "purple" | "emerald" | "rose";
  featured?: boolean;
}

const ACCENT: Record<NonNullable<CardDef["accent"]>, string> = {
  gold: "text-amber-500",
  purple: "text-[var(--brand-500)]",
  emerald: "text-emerald-500",
  rose: "text-rose-500",
};

function StatCard({ def, index }: { def: CardDef; index: number }) {
  const accent = def.accent ? ACCENT[def.accent] : "text-muted-foreground";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-[22px] border border-white/10 bg-card/70 p-4 glass clay-sm",
        def.featured && "sm:col-span-2",
      )}
    >
      {/* soft corner glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: "radial-gradient(circle, currentColor, transparent 70%)" }}
      />
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{def.label}</p>
        <def.icon className={cn("size-4", accent)} />
      </div>
      <p className={cn("mt-2 font-bold tabular-nums", def.featured ? "text-4xl" : "text-3xl")}>{def.value}</p>
      {def.hint && <p className="mt-0.5 text-xs text-muted-foreground">{def.hint}</p>}
    </motion.div>
  );
}

/** Radial win-rate meter — the visual centrepiece of the stat block. */
function WinRateMeter({ pct, wins, losses }: { pct: number; wins: number; losses: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative flex flex-col items-center justify-center rounded-[22px] border border-white/10 bg-card/70 p-4 glass clay-sm sm:row-span-2"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Win rate</p>
      <div className="relative mt-2 grid place-items-center">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--secondary)" strokeWidth="12" />
          <motion.circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="url(#wr)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * pct) / 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="wr" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffc66d" />
              <stop offset="1" stopColor="var(--brand-500)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute text-center">
          <span className="text-3xl font-bold tabular-nums">{pct}%</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {wins}W · {losses}L
      </p>
    </motion.div>
  );
}

export function PremiumStats({ data }: { data: PlayerProfileData }) {
  const s = data.stats;
  const cards: CardDef[] = [
    { label: "Rating", value: data.ratingLabel, hint: data.levelLabel, icon: Trophy, accent: "gold" },
    { label: "Games", value: s.games, icon: Gamepad2, accent: "purple" },
    { label: "Wins", value: s.wins, icon: TrendingUp, accent: "emerald" },
    { label: "Losses", value: s.losses, icon: TrendingDown, accent: "rose" },
    { label: "Current streak", value: s.currentStreak, hint: s.currentStreak > 0 ? "on a roll 🔥" : undefined, icon: Activity, accent: "purple" },
    { label: "Longest streak", value: s.longestStreak, icon: Flame, accent: "gold" },
    { label: "Followers", value: s.followers, icon: Heart, accent: "rose" },
    { label: "Following", value: s.following, icon: UserPlus, accent: "purple" },
  ];

  const { gold, silver, bronze } = data.medals;
  const hasMedals = gold + silver + bronze > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <WinRateMeter pct={s.winPct} wins={s.wins} losses={s.losses} />
        {cards.map((def, i) => (
          <StatCard key={def.label} def={def} index={i} />
        ))}
      </div>

      {hasMedals && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 rounded-[22px] border border-white/10 bg-card/70 p-4 glass clay-sm"
        >
          <div className="flex items-center gap-2">
            <Medal className="size-5 text-amber-500" />
            <span className="text-sm font-semibold">Medals</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold tabular-nums">
            <span className="inline-flex items-center gap-1.5">🥇 {gold} Gold</span>
            <span className="inline-flex items-center gap-1.5">🥈 {silver} Silver</span>
            <span className="inline-flex items-center gap-1.5">🥉 {bronze} Bronze</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
