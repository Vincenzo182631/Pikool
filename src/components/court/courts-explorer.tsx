"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LocateFixed, Search, Plus, Info } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourtCard } from "@/components/court/court-card";
import { CourtMap } from "@/components/court/court-map";
import { COURT_SURFACES, COURT_ENVIRONMENTS } from "@/lib/validation/court";
import type { CourtListItem } from "@/types/court";

const selectClass =
  "h-9 rounded-2xl border border-border/60 bg-secondary/60 px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CourtsExplorer() {
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [surface, setSurface] = React.useState("");
  const [environment, setEnvironment] = React.useState("");
  const [lighting, setLighting] = React.useState(false);
  const [sort, setSort] = React.useState<"rating" | "distance" | "name">("rating");
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams();
  if (debouncedQ) params.set("q", debouncedQ);
  if (surface) params.set("surface", surface);
  if (environment) params.set("environment", environment);
  if (lighting) params.set("lighting", "true");
  params.set("sort", sort);
  params.set("limit", "300");
  if (coords) {
    params.set("lat", String(coords.lat));
    params.set("lng", String(coords.lng));
  }

  const { data: courts, isLoading } = useQuery({
    queryKey: ["courts", params.toString()],
    queryFn: () => api.get<CourtListItem[]>(`/api/courts?${params.toString()}`),
  });

  function locate() {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't available in your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("distance");
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

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courts or cities…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <select className={selectClass} value={environment} onChange={(e) => setEnvironment(e.target.value)} aria-label="Environment">
          <option value="">Any type</option>
          {COURT_ENVIRONMENTS.map((e) => (
            <option key={e} value={e}>
              {e.charAt(0) + e.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select className={selectClass} value={surface} onChange={(e) => setSurface(e.target.value)} aria-label="Surface">
          <option value="">Any surface</option>
          {COURT_SURFACES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setLighting((v) => !v)}
          className={`h-9 rounded-full px-3 text-sm font-semibold press ${
            lighting ? "bg-primary text-primary-foreground shadow-subtle" : "bg-secondary/60 text-muted-foreground"
          }`}
        >
          Lit
        </button>
        <select className={selectClass} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
          <option value="rating">Top rated</option>
          <option value="distance" disabled={!coords}>Nearest</option>
          <option value="name">Name</option>
        </select>
        <Button variant="outline" size="sm" onClick={locate} loading={locating}>
          <LocateFixed /> Near me
        </Button>
        <Button asChild size="sm">
          <Link href="/courts/new">
            <Plus /> Add court
          </Link>
        </Button>
      </div>

      {/* Interactive map (free — Leaflet + OpenStreetMap, no API key) */}
      <CourtMap courts={courts ?? []} center={coords ?? undefined} />

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : !courts || courts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Info className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p className="font-medium">No courts found</p>
          <p className="text-sm text-muted-foreground">
            Try widening your filters, or add a court to put it on the map.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {courts.length} court{courts.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
