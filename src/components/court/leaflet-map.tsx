"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BusyMeter } from "@/components/court/busy-meter";
import type { CourtListItem, BusyLevel } from "@/types/court";

const PIN_COLOR: Record<BusyLevel, string> = {
  quiet: "#12b76a",
  moderate: "#f79009",
  busy: "#f04438",
};

/** A teardrop pin as a divIcon (no image assets → no bundler path issues). */
function pinIcon(level: BusyLevel) {
  const color = PIN_COLOR[level];
  return L.divIcon({
    className: "",
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.2 13 21 13 21s13-11.8 13-21C26 5.82 20.18 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="white"/></svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -32],
  });
}

/** Fit the map to all markers, or center on the user's location when provided. */
function FitBounds({
  courts,
  center,
}: {
  courts: CourtListItem[];
  center?: { lat: number; lng: number };
}) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 12);
    } else if (courts.length > 0) {
      const bounds = L.latLngBounds(courts.map((c) => [c.lat, c.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [map, courts, center]);
  return null;
}

export default function LeafletMap({
  courts,
  center,
}: {
  courts: CourtListItem[];
  center?: { lat: number; lng: number };
}) {
  const router = useRouter();

  return (
    <MapContainer
      center={[12.8, 121.7]}
      zoom={6}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "var(--secondary)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds courts={courts} center={center} />
      {courts.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lng]} icon={pinIcon(c.busyLevel)}>
          <Popup>
            <div className="min-w-40 space-y-1">
              <p className="font-semibold">{c.name}</p>
              {c.city && <p className="text-xs text-gray-600">{c.city}</p>}
              <BusyMeter level={c.busyLevel} count={c.occupancy} />
              <button
                className="mt-1 block text-xs font-semibold text-emerald-600 hover:underline"
                onClick={() => router.push(`/courts/${c.id}`)}
              >
                View court →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
