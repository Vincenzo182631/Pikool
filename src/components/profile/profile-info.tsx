"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Backpack, MapPin, Quote, Swords, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PlayerProfileData } from "@/types/player-profile";

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-card/60 p-5 glass clay"
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-5 text-[var(--brand-500)]" />
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function GearRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/50 px-4 py-3 clay-inset">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  );
}

export function ProfileAbout({ data }: { data: PlayerProfileData }) {
  return (
    <Panel icon={Quote} title="About">
      {data.bio ? (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{data.bio}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {data.isOwner ? "Add a bio from Edit profile to tell the community about your game." : "No bio yet."}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {data.formats.map((f) => (
          <Badge key={f} variant="accent">
            <Swords className="size-3" /> {f}
          </Badge>
        ))}
        {data.availability.map((a) => (
          <Badge key={a} variant="secondary">
            {a}
          </Badge>
        ))}
      </div>
    </Panel>
  );
}

export function ProfileEquipment({ data }: { data: PlayerProfileData }) {
  const rows: { label: string; value: string }[] = [];
  if (data.favoritePaddle) rows.push({ label: "Current paddle", value: data.favoritePaddle });
  if (data.playingStyle) rows.push({ label: "Playing style", value: data.playingStyle });
  if (data.homeCourt) {
    rows.push({
      label: "Home court",
      value: data.homeCourt.city ? `${data.homeCourt.name} · ${data.homeCourt.city}` : data.homeCourt.name,
    });
  }

  return (
    <Panel icon={Backpack} title="Equipment">
      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map((r) => (
            <GearRow key={r.label} {...r} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {data.isOwner ? "Add your paddle and playing style from Edit profile." : "No equipment listed yet."}
        </p>
      )}

      {data.isOwner && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <Wand2 className="size-3.5" />
          Shoes, bag, grip, ball &amp; apparel are coming soon.
        </p>
      )}
    </Panel>
  );
}

export function ProfileQuickFacts({ data }: { data: PlayerProfileData }) {
  const facts: { label: string; value: string }[] = [
    { label: "Level", value: `${data.levelTier} · ${data.ratingLabel}` },
    { label: "Dominant hand", value: `${data.dominantHand}-handed` },
    { label: "Years playing", value: `${data.yearsPlaying} yr${data.yearsPlaying === 1 ? "" : "s"}` },
    { label: "Member since", value: data.memberSince },
  ];
  if (data.showLocation && (data.city || data.country)) {
    facts.unshift({ label: "Location", value: [data.city, data.country].filter(Boolean).join(", ") });
  }
  return (
    <Panel icon={MapPin} title="Player details">
      <dl className="grid grid-cols-2 gap-2">
        {facts.map((f) => (
          <div key={f.label} className="rounded-2xl bg-secondary/50 px-4 py-3 clay-inset">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</dt>
            <dd className="mt-0.5 truncate text-sm font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
