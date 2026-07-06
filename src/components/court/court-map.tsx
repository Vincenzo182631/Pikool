"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { BusyMeter } from "@/components/court/busy-meter";
import type { CourtListItem } from "@/types/court";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;

export const mapsEnabled = Boolean(MAPS_KEY);

/**
 * Interactive Google Map of courts. Rendered only when a browser Maps key is
 * configured; callers fall back to the list view otherwise.
 */
export function CourtMap({
  courts,
  center,
}: {
  courts: CourtListItem[];
  center?: { lat: number; lng: number };
}) {
  const router = useRouter();
  const [active, setActive] = React.useState<CourtListItem | null>(null);

  if (!MAPS_KEY) return null;

  const fallbackCenter = center ??
    (courts[0] ? { lat: courts[0].lat, lng: courts[0].lng } : { lat: 39.5, lng: -98.35 });

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-border">
      <APIProvider apiKey={MAPS_KEY}>
        <Map
          defaultCenter={fallbackCenter}
          defaultZoom={center ? 11 : 4}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
        >
          {courts.map((c) => (
            <Marker
              key={c.id}
              position={{ lat: c.lat, lng: c.lng }}
              onClick={() => setActive(c)}
            />
          ))}
          {active && (
            <InfoWindow
              position={{ lat: active.lat, lng: active.lng }}
              onCloseClick={() => setActive(null)}
            >
              <div className="min-w-40 space-y-1 p-1 text-black">
                <p className="font-semibold">{active.name}</p>
                {active.city && <p className="text-xs text-gray-600">{active.city}</p>}
                <BusyMeter level={active.busyLevel} count={active.occupancy} />
                <button
                  className="mt-1 block text-xs font-medium text-emerald-600 hover:underline"
                  onClick={() => router.push(`/courts/${active.id}`)}
                >
                  View court →
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
