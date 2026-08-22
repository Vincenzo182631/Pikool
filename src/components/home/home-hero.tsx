"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Chip } from "@/components/ui/chip";
import { Rating } from "@/components/ui/editorial";

const CATEGORIES = ["All", "Courts", "Camps", "Events"] as const;
type Category = (typeof CATEGORIES)[number];

/** Where each category chip sends the user. */
const CATEGORY_HREF: Record<Category, string> = {
  All: "/courts",
  Courts: "/courts",
  Camps: "/events?tab=Camps",
  Events: "/events?tab=Events",
};

/**
 * Home hero: category rail + the full-bleed "Popular Courts" promo card.
 * Client-side so the chips and card presses stay interactive.
 */
export function HomeHero({
  featuredCourtId,
  featuredName,
  location,
  rating,
}: {
  featuredCourtId: string | null;
  featuredName: string;
  location: string;
  rating: number | null;
}) {
  const router = useRouter();
  const [cat, setCat] = React.useState<Category>("All");
  const href = featuredCourtId ? `/courts/${featuredCourtId}` : "/courts";

  return (
    <>
      {/* Category chips */}
      <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            active={cat === c}
            onClick={() => {
              setCat(c);
              if (c !== "All") router.push(CATEGORY_HREF[c]);
            }}
          >
            {c}
          </Chip>
        ))}
      </div>

      {/* Popular Courts promo */}
      <div
        role="link"
        tabIndex={0}
        onClick={() => router.push(href)}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(href);
        }}
        className="press relative block h-[260px] w-full cursor-pointer overflow-hidden rounded-3xl text-left shadow-hero focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-[300px]"
      >
        <Image
          src="/editorial/popular_courts.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
        />
        <div className="scrim-tb absolute inset-0" />

        <div className="absolute inset-x-4 top-4 text-white">
          <p className="text-xs font-medium opacity-90">Explore the</p>
          <p className="font-display mb-2.5 text-[26px] font-bold leading-none">{featuredName}</p>
          <p className="max-w-[75%] text-xs leading-relaxed opacity-90">
            Join our premier pickleball club for unforgettable games, expert coaching.
          </p>
        </div>

        {rating !== null && (
          <Rating value={rating} className="absolute right-4 top-4 rounded-lg bg-white/90 px-2 py-1" />
        )}

        <span className="absolute bottom-[72px] left-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-black/35 px-[11px] py-[5px] text-[11.5px] font-semibold text-white backdrop-blur-sm">
          <MapPin className="size-3" strokeWidth={2} /> {location}
        </span>

        <div className="absolute inset-x-4 bottom-4 flex items-center gap-2.5">
          <Button
            asChild
            size="md"
            className="flex-1"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Link href={featuredCourtId ? `/booking/${featuredCourtId}` : "/courts"}>Book Now</Link>
          </Button>
          <IconButton
            variant="dark"
            size={42}
            aria-label="Save court"
            onClick={(e) => e.stopPropagation()}
          >
            <Bookmark className="size-4" strokeWidth={1.8} />
          </IconButton>
        </div>
      </div>
    </>
  );
}
