"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Award, CalendarClock, Image as ImageIcon, MapPin, Newspaper, Sparkles, UserRoundCog, type LucideIcon } from "lucide-react";
import type { ActivityKind, PlayerProfileData } from "@/types/player-profile";

const KIND_META: Record<ActivityKind, { icon: LucideIcon; tone: string }> = {
  join: { icon: Sparkles, tone: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-400/15 dark:text-fuchsia-300" },
  profile: { icon: UserRoundCog, tone: "bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300" },
  post: { icon: Newspaper, tone: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" },
  media: { icon: ImageIcon, tone: "bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300" },
  achievement: { icon: Award, tone: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" },
  match: { icon: MapPin, tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" },
  generic: { icon: CalendarClock, tone: "bg-secondary text-muted-foreground" },
};

export function ProfileActivity({ data }: { data: PlayerProfileData }) {
  const items = data.activity;

  return (
    <section className="rounded-3xl border border-white/10 bg-card/60 p-5 glass clay">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="size-5 text-[var(--brand-500)]" />
        <h2 className="text-base font-bold tracking-tight">Recent activity</h2>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-secondary/40 py-8 text-center text-sm text-muted-foreground clay-inset">
          No recent activity yet.
        </p>
      ) : (
        <ol className="relative space-y-1">
          <span aria-hidden className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
          {items.map((it, i) => {
            const meta = KIND_META[it.kind];
            return (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="relative flex items-start gap-3 rounded-2xl px-2 py-2 hover:bg-secondary/40"
              >
                <span className={`z-10 grid size-9 shrink-0 place-items-center rounded-full clay-sm ${meta.tone}`}>
                  <meta.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-medium">{it.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.detail ? `${it.detail} · ` : ""}
                    {formatDistanceToNow(new Date(it.date), { addSuffix: true })}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
