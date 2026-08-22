"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CourtArt } from "@/components/court/court-art";
import { Button } from "@/components/ui/button";
import { Rating, PriceTag } from "@/components/ui/editorial";
import { formatDistance } from "@/lib/services/court";
import type { CourtListItem } from "@/types/court";

/** Fallback blurb when a court has no description of its own. */
function blurb(court: CourtListItem): string {
  const bits = [
    court.environment === "INDOOR" ? "Indoor facility" : "Outdoor courts",
    `${court.surface.charAt(0)}${court.surface.slice(1).toLowerCase()} surface`,
  ];
  if (court.hasLighting) bits.push("lit for night play");
  if (court.amenities.length) bits.push(court.amenities.slice(0, 2).join(", ").toLowerCase());
  return `${bits.join(" · ")}.`;
}

/**
 * Editorial court row — 96px thumbnail, name + price, two-line blurb, and a
 * rating/Book-Now footer. The row navigates to detail; Book Now skips to booking.
 */
export function CourtRow({ court, index = 0 }: { court: CourtListItem; index?: number }) {
  const router = useRouter();
  const href = `/courts/${court.id}`;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="press animate-slidein flex w-full cursor-pointer gap-3 rounded-[18px] bg-card p-2.5 text-left shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-[14px] bg-secondary">
        {court.thumbnailUrl ? (
          <Image src={court.thumbnailUrl} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <CourtArt seed={court.id} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display truncate text-[17px] font-bold text-ink">{court.name}</h3>
          {court.pricePerHour !== null && <PriceTag amount={court.pricePerHour} />}
        </div>

        <p className="mt-0.5 line-clamp-2 text-[11px] leading-[1.4] text-muted-foreground">
          {blurb(court)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <div className="flex items-center gap-2.5">
            {court.ratingCount > 0 ? (
              <Rating value={court.ratingAvg} />
            ) : (
              <span className="text-[11px] text-muted-foreground">New</span>
            )}
            {court.distanceM !== null && (
              <span className="text-[11px] text-muted-foreground">
                {formatDistance(court.distanceM)}
              </span>
            )}
          </div>
          <Button asChild size="sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Link href={`/booking/${court.id}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
