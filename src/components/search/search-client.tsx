"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Clock, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { Eyebrow } from "@/components/ui/editorial";
import { CourtArt } from "@/components/court/court-art";
import { formatDistance } from "@/lib/services/court";
import type { CourtListItem } from "@/types/court";

const RECENT = ["Sunset Courts", "Brooklyn indoor", "Doubles beginner", "Weekend evening"];
const SURFACES = ["Any", "Concrete", "Asphalt", "Acrylic", "Wood"] as const;
const AVAILABILITY = ["Any", "Available now", "Today", "This week"] as const;

const DEFAULTS = { surface: "Any" as string, avail: "Any" as string, maxPrice: 80 };

export function SearchClient() {
  const [q, setQ] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [surface, setSurface] = React.useState(DEFAULTS.surface);
  const [avail, setAvail] = React.useState(DEFAULTS.avail);
  const [maxPrice, setMaxPrice] = React.useState(DEFAULTS.maxPrice);

  const { data } = useQuery({
    queryKey: ["courts", "search"],
    queryFn: () => api.get<CourtListItem[]>("/api/courts?limit=100&sort=rating"),
  });

  const courts = data ?? [];
  const needle = q.trim().toLowerCase();

  const filtered = courts
    .filter((c) => surface === "Any" || c.surface === surface.toUpperCase())
    .filter((c) => avail === "Any" || avail !== "Available now" || c.busyLevel !== "busy")
    .filter((c) => c.pricePerHour === null || c.pricePerHour <= maxPrice);

  const results = needle
    ? filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) || (c.city ?? "").toLowerCase().includes(needle),
      )
    : filtered.slice(0, 6);

  const filtersActive =
    surface !== DEFAULTS.surface || avail !== DEFAULTS.avail || maxPrice !== DEFAULTS.maxPrice;

  function reset() {
    setSurface(DEFAULTS.surface);
    setAvail(DEFAULTS.avail);
    setMaxPrice(DEFAULTS.maxPrice);
  }

  return (
    <>
      {/* Search bar */}
      <div className="mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courts, clubs..."
            aria-label="Search"
            className="h-[46px] w-full rounded-full bg-card pl-11 pr-10 text-sm text-ink shadow-icon outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-ink/[0.06] text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <IconButton
          variant={showFilters || filtersActive ? "filled" : "default"}
          onClick={() => setShowFilters(true)}
          aria-label="Filters"
        >
          <SlidersHorizontal className="size-[18px]" strokeWidth={1.8} />
        </IconButton>
      </div>

      {!needle && (
        <section className="mb-6">
          <Eyebrow className="mb-2.5">Recent</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {RECENT.map((r) => (
              <Chip key={r} onClick={() => setQ(r)}>
                <Clock className="size-3.5" strokeWidth={1.8} /> {r}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <Eyebrow className="mb-2.5">{needle ? `${results.length} result(s) for “${q}”` : "Popular near you"}</Eyebrow>

      {results.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-muted-foreground">
          No matches. Try a different keyword.
        </p>
      ) : (
        <div className="space-y-2.5">
          {results.map((c) => (
            <Link
              key={c.id}
              href={`/courts/${c.id}`}
              className="press flex items-center gap-3.5 rounded-[18px] bg-card p-3.5 shadow-card"
            >
              <div className="relative size-[46px] shrink-0 overflow-hidden rounded-xl bg-secondary">
                {c.thumbnailUrl ? (
                  <Image src={c.thumbnailUrl} alt="" fill sizes="46px" className="object-cover" />
                ) : (
                  <CourtArt seed={c.id} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{c.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.pricePerHour !== null ? `$${c.pricePerHour}/hr` : "Price on request"}
                  {c.distanceM !== null ? ` · ${formatDistance(c.distanceM)}` : c.city ? ` · ${c.city}` : ""}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
            </Link>
          ))}
        </div>
      )}

      {/* Filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="animate-backdrop-in absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div
            role="dialog"
            aria-label="Filters"
            className="animate-sheet-up relative w-full max-w-2xl rounded-t-[24px] bg-card px-5 pb-8 pt-2.5"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold text-ink">Filters</h2>
              <button
                type="button"
                onClick={reset}
                className="text-[13px] font-semibold text-muted-foreground hover:text-ink"
              >
                Reset
              </button>
            </div>

            <FilterGroup label="Surface">
              {SURFACES.map((s) => (
                <Chip key={s} active={surface === s} onClick={() => setSurface(s)}>
                  {s}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="Availability">
              {AVAILABILITY.map((a) => (
                <Chip key={a} active={avail === a} onClick={() => setAvail(a)}>
                  {a}
                </Chip>
              ))}
            </FilterGroup>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="maxPrice" className="text-[13px] font-semibold text-ink">
                  Max price
                </label>
                <span className="text-[13px] font-bold text-ink">${maxPrice}/hr</span>
              </div>
              <input
                id="maxPrice"
                type="range"
                min={10}
                max={80}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[var(--accent-500)]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>$10</span>
                <span>$80</span>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={() => setShowFilters(false)}>
              Apply filters
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2.5 text-[13px] font-semibold text-ink">{label}</p>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}
