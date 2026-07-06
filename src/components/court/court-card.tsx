import Link from "next/link";
import Image from "next/image";
import { MapPin, Lightbulb, Home, Sun, Star, BadgeCheck } from "lucide-react";
import { BusyMeter } from "@/components/court/busy-meter";
import { CourtArt } from "@/components/court/court-art";
import { formatDistance } from "@/lib/services/court";
import type { CourtListItem } from "@/types/court";

/** A court in the list/grid. Links to the detail page. */
export function CourtCard({ court }: { court: CourtListItem }) {
  return (
    <Link
      href={`/courts/${court.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card clay transition-transform hover:-translate-y-0.5"
    >
      <div className="relative h-32 w-full bg-secondary">
        {court.thumbnailUrl ? (
          <Image src={court.thumbnailUrl} alt="" fill className="object-cover" sizes="400px" />
        ) : (
          <CourtArt seed={court.id} />
        )}
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-xs font-medium text-white">
          {court.environment === "INDOOR" ? <Home className="size-3" /> : <Sun className="size-3" />}
          {court.environment === "INDOOR" ? "Indoor" : "Outdoor"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-1 font-semibold leading-tight">
            {court.name}
            {court.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {court.ratingCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{court.ratingAvg.toFixed(1)}</span>
              <span>({court.ratingCount})</span>
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
          {court.hasLighting && (
            <span className="inline-flex items-center gap-1">
              <Lightbulb className="size-3.5" /> Lit
            </span>
          )}
        </div>

        {(court.city || court.distanceM !== null) && (
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {court.city}
            {court.distanceM !== null && (
              <span className="text-foreground"> · {formatDistance(court.distanceM)}</span>
            )}
          </p>
        )}

        <div className="mt-auto pt-1">
          <BusyMeter level={court.busyLevel} count={court.occupancy} />
        </div>
      </div>
    </Link>
  );
}
