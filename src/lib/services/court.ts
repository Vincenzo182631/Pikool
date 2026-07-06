import { CHECKIN_TTL_HOURS } from "@/lib/constants";

/** Busy-level buckets from a live check-in count (see docs/10). */
export type BusyLevel = "quiet" | "moderate" | "busy";

export function busyLevel(count: number): BusyLevel {
  if (count >= 5) return "busy";
  if (count >= 2) return "moderate";
  return "quiet";
}

export const BUSY_META: Record<BusyLevel, { label: string; tone: string }> = {
  quiet: { label: "Quiet", tone: "text-emerald-500" },
  moderate: { label: "Moderate", tone: "text-amber-500" },
  busy: { label: "Busy", tone: "text-rose-500" },
};

/** When a new check-in expires (keeps occupancy fresh). */
export function checkInExpiry(from = Date.now()): Date {
  return new Date(from + CHECKIN_TTL_HOURS * 60 * 60 * 1000);
}

/** Haversine distance in meters between two lat/lng points. */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** A bounding box (in degrees) around a point for a coarse radius pre-filter. */
export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111; // ~111 km per degree latitude
  const lngDelta = radiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/** Format meters as a short human distance. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}
