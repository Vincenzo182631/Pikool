"use client";

import dynamic from "next/dynamic";
import type { CourtListItem } from "@/types/court";

// Leaflet touches `window`, so load the map only in the browser.
const LeafletMap = dynamic(() => import("@/components/court/leaflet-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-secondary" />,
});

/** Free, keyless map of courts (Leaflet + OpenStreetMap). No API key required. */
export function CourtMap({
  courts,
  center,
}: {
  courts: CourtListItem[];
  center?: { lat: number; lng: number };
}) {
  return (
    <div className="h-[440px] w-full overflow-hidden rounded-2xl border border-border">
      <LeafletMap courts={courts} center={center} />
    </div>
  );
}
