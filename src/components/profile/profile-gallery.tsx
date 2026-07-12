"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, X } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { GalleryCategory, PlayerProfileData } from "@/types/player-profile";

type Filter = "All" | GalleryCategory;
const FILTERS: Filter[] = ["All", "Tournament", "Training", "Equipment", "Lifestyle"];

/** Cycling tile aspect ratios give the columns a staggered, Pinterest-like feel. */
const TILE_ASPECT = ["aspect-square", "aspect-[3/4]", "aspect-[4/5]", "aspect-[4/3]"];

export function ProfileGallery({ data }: { data: PlayerProfileData }) {
  const [filter, setFilter] = React.useState<Filter>("All");
  const [lightbox, setLightbox] = React.useState<string | null>(null);

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { All: data.gallery.length };
    for (const g of data.gallery) c[g.category] = (c[g.category] ?? 0) + 1;
    return c;
  }, [data.gallery]);

  const items = filter === "All" ? data.gallery : data.gallery.filter((g) => g.category === filter);

  return (
    <section className="rounded-3xl border border-white/10 bg-card/60 p-5 glass clay">
      {/* filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = counts[f] ?? 0;
          if (f !== "All" && n === 0) return null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold clay-pressable transition-colors",
                filter === f ? "grad-primary text-white clay-sm" : "bg-secondary/70 text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
              <span className="tabular-nums opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/40 py-12 text-center clay-inset">
          <ImageOff className="size-6 text-muted-foreground/60" />
          <p className="max-w-[32ch] text-sm text-muted-foreground">
            {data.isOwner ? "Share photos in the feed and they'll show up here." : "No media in this gallery yet."}
          </p>
        </div>
      ) : (
        // Pinterest-style masonry via CSS columns with staggered tile heights.
        <div className="[column-fill:_balance] gap-3 sm:columns-2 lg:columns-3">
          {items.map((g, i) => (
            <motion.button
              key={g.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              onClick={() => setLightbox(g.url)}
              className={cn(
                "group relative mb-3 block w-full overflow-hidden rounded-2xl clay-sm",
                TILE_ASPECT[i % TILE_ASPECT.length],
              )}
            >
              <SmartImage src={g.url} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" sizes="(min-width:1024px) 300px, (min-width:640px) 45vw, 90vw" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                  {g.category}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Media preview"
          >
            <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm" />
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close preview"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25"
            >
              <X className="size-5" />
            </button>
            <motion.div
              className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-3xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SmartImage src={lightbox} alt="" width={1024} height={1024} className="max-h-[85vh] w-auto object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
