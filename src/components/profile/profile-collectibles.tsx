"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerProfileData } from "@/types/player-profile";

const TIER_STYLE: Record<string, { ring: string; glow: string; emoji: string }> = {
  PLATINUM: { ring: "ring-cyan-300/60", glow: "from-cyan-200/40", emoji: "💎" },
  GOLD: { ring: "ring-amber-300/70", glow: "from-amber-200/50", emoji: "🥇" },
  SILVER: { ring: "ring-slate-300/70", glow: "from-slate-200/50", emoji: "🥈" },
  BRONZE: { ring: "ring-orange-300/60", glow: "from-orange-200/40", emoji: "🥉" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface Collectible {
  id: string;
  name: string;
  description: string;
  date: string;
  tier: string; // GOLD/SILVER/... or "ACHIEVEMENT"
}

function CollectibleCard({ c, index }: { c: Collectible; index: number }) {
  const style = TIER_STYLE[c.tier];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ y: -5, rotate: -0.5 }}
      className="group relative flex flex-col items-center overflow-hidden rounded-[20px] border border-white/10 bg-card/70 p-4 text-center glass clay-sm"
      title={c.description}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-6 mx-auto h-16 w-16 rounded-full bg-gradient-to-b to-transparent opacity-0 blur-xl transition-opacity group-hover:opacity-100",
          style?.glow ?? "from-[var(--brand-300)]/40",
        )}
      />
      <div
        className={cn(
          "grid size-14 place-items-center rounded-2xl bg-secondary/70 text-2xl ring-2 clay-sm",
          style?.ring ?? "ring-[var(--brand-300)]/50",
        )}
      >
        {style ? style.emoji : <Award className="size-6 text-[var(--brand-500)]" />}
      </div>
      <p className="mt-2.5 line-clamp-1 text-sm font-semibold">{c.name}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
        {fmtDate(c.date)}
      </p>
    </motion.div>
  );
}

export function ProfileCollectibles({ data }: { data: PlayerProfileData }) {
  const items: Collectible[] = [
    ...data.badges.map((b) => ({ id: `b-${b.id}`, name: b.name, description: b.description, date: b.date, tier: b.tier })),
    ...data.achievements.map((a) => ({ id: `a-${a.id}`, name: a.name, description: a.description, date: a.date, tier: "ACHIEVEMENT" })),
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-card/60 p-5 glass clay">
      <div className="mb-4 flex items-center gap-2">
        <Award className="size-5 text-amber-500" />
        <h2 className="text-base font-bold tracking-tight">Achievements</h2>
        {items.length > 0 && (
          <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/40 py-8 text-center clay-inset">
          <Lock className="size-6 text-muted-foreground/60" />
          <p className="max-w-[34ch] text-sm text-muted-foreground">
            {data.isOwner
              ? "No badges yet — play matches, check in to courts, and join events to start collecting."
              : "No achievements collected yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((c, i) => (
            <CollectibleCard key={c.id} c={c} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
