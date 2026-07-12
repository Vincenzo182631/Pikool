"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Hand, MapPin, UserPen } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SmartImage } from "@/components/ui/smart-image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/profile/profile-actions";
import { ShareProfile } from "@/components/profile/share-dialog";
import { PremiumStats } from "@/components/profile/premium-stats";
import { ProfileCharts } from "@/components/profile/profile-charts";
import { ProfileCollectibles } from "@/components/profile/profile-collectibles";
import { ProfileAbout, ProfileEquipment, ProfileQuickFacts } from "@/components/profile/profile-info";
import { ProfileActivity } from "@/components/profile/profile-activity";
import { ProfileGallery } from "@/components/profile/profile-gallery";
import { cn, initials } from "@/lib/utils";
import type { PlayerProfileData } from "@/types/player-profile";

/** Faint pickleball-court line pattern used behind the hero. */
function CourtLines({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
        <rect x="24" y="18" width="352" height="164" rx="4" />
        <line x1="24" y1="100" x2="376" y2="100" />
        <line x1="200" y1="18" x2="200" y2="182" />
        <rect x="24" y="60" width="352" height="80" />
        <line x1="130" y1="18" x2="130" y2="182" />
        <line x1="270" y1="18" x2="270" y2="182" />
      </g>
    </svg>
  );
}

const TABS = ["Overview", "Stats", "Gallery", "Activity"] as const;
type Tab = (typeof TABS)[number];

export function PlayerProfile({ data }: { data: PlayerProfileData }) {
  const [tab, setTab] = React.useState<Tab>("Overview");

  return (
    <div className="mx-auto max-w-4xl pb-16">
      {/* ---------------- Hero ---------------- */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-card clay">
        {/* Cover */}
        <div className="relative h-40 w-full sm:h-56">
          {data.coverUrl ? (
            <SmartImage src={data.coverUrl} alt="" fill className="object-cover" sizes="900px" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(120deg, var(--brand-600), var(--brand-500) 45%, #ff6f91)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <CourtLines className="absolute inset-0 h-full w-full text-white/25" />
        </div>

        <div className="px-5 pb-6 sm:px-7">
          {/* Avatar + actions */}
          <div className="-mt-14 flex items-end justify-between gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="relative"
            >
              <span
                aria-hidden
                className="absolute -inset-1 rounded-full opacity-70 blur-md"
                style={{ background: "conic-gradient(from 180deg, #ffc66d, var(--brand-500), #ff6f91, #ffc66d)" }}
              />
              <Avatar
                src={data.avatarUrl}
                fallback={initials(data.fullName.split(" ")[0], data.fullName.split(" ")[1])}
                size={104}
                className="relative ring-4 ring-card"
              />
            </motion.div>

            <div className="flex gap-2 pb-1">
              {data.isOwner ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/edit">
                    <UserPen /> Edit profile
                  </Link>
                </Button>
              ) : (
                <FollowButton username={data.username} />
              )}
              <ShareProfile username={data.username} displayName={data.displayName} />
            </div>
          </div>

          {/* Identity */}
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.displayName}</h1>
              <RatingBadge level={data.skillLevel} />
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                {data.levelTier}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">@{data.username}</p>
          </div>

          {/* Meta chips */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {data.showLocation && (data.city || data.country) && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {[data.city, data.country].filter(Boolean).join(", ")}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Hand className="size-4" />
              {data.dominantHand}-handed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              Member since {data.memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- Tabs ---------------- */}
      <div className="sticky top-2 z-20 mt-4">
        <div className="flex gap-1 rounded-full border border-white/10 bg-card/70 p-1 glass clay-sm">
          {TABS.map((t) => {
            const active = tab === t;
            const hide = t === "Stats" && !data.showStats;
            if (hide) return null;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                  active ? "text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full grad-primary clay-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------- Tab content ---------------- */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "Overview" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <ProfileQuickFacts data={data} />
                  <ProfileEquipment data={data} />
                </div>
                <ProfileAbout data={data} />
                <ProfileCollectibles data={data} />
              </div>
            )}

            {tab === "Stats" && data.showStats && (
              <div className="space-y-4">
                <PremiumStats data={data} />
                <ProfileCharts data={data} />
              </div>
            )}

            {tab === "Gallery" && <ProfileGallery data={data} />}

            {tab === "Activity" && <ProfileActivity data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
