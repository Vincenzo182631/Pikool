"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { CourtRow } from "@/components/court/court-row";
import type { CourtListItem } from "@/types/court";

/** Filter chips — each maps onto a predicate over the fetched list. */
const FILTERS = ["Available Now", "Indoor", "Outdoor", "Lit", "Verified"] as const;
type Filter = (typeof FILTERS)[number];

const PREDICATE: Record<Filter, (c: CourtListItem) => boolean> = {
  "Available Now": (c) => c.busyLevel !== "busy",
  Indoor: (c) => c.environment === "INDOOR",
  Outdoor: (c) => c.environment === "OUTDOOR",
  Lit: (c) => c.hasLighting,
  Verified: (c) => c.verified,
};

export function FindCourt() {
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("Available Now");
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = React.useState(false);

  const params = new URLSearchParams({ limit: "60", sort: coords ? "distance" : "rating" });
  if (coords) {
    params.set("lat", String(coords.lat));
    params.set("lng", String(coords.lng));
  }

  const { data, isLoading } = useQuery({
    queryKey: ["courts", params.toString()],
    queryFn: () => api.get<CourtListItem[]>(`/api/courts?${params.toString()}`),
  });

  function locate() {
    if (!navigator.geolocation) return toast.error("Geolocation isn't available.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Showing courts near you");
      },
      () => {
        setLocating(false);
        toast.error("Couldn't get your location.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const courts = data ?? [];
  const needle = q.trim().toLowerCase();
  const visible = courts
    .filter((c) => PREDICATE[filter](c))
    .filter(
      (c) =>
        !needle ||
        c.name.toLowerCase().includes(needle) ||
        (c.city ?? "").toLowerCase().includes(needle),
    );

  return (
    <>
      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courts, clubs..."
            aria-label="Search courts"
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
          onClick={locate}
          disabled={locating}
          variant={coords ? "filled" : "default"}
          aria-label="Use my location"
        >
          <LocateFixed className="size-[18px]" strokeWidth={1.8} />
        </IconButton>
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[116px] animate-pulse rounded-[18px] bg-card/70" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="py-14 text-center text-[13px] text-muted-foreground">
          {needle ? `No courts match “${q}”` : "No courts match these filters."}
        </p>
      ) : (
        <div className="space-y-3.5">
          {visible.map((c, i) => (
            <CourtRow key={c.id} court={c} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
