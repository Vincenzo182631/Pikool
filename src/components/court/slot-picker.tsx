"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 06:00 → 20:00 in two-hour steps (handoff §Today's Availability). */
const SLOTS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

/**
 * Today's availability grid plus the sticky "Book for …" bar.
 *
 * `takenSlots` is derived server-side from live check-ins so the grid reflects
 * real occupancy rather than a hardcoded pattern.
 */
export function SlotPicker({
  courtId,
  price,
  takenSlots,
}: {
  courtId: string;
  price: number | null;
  takenSlots: string[];
}) {
  const taken = React.useMemo(() => new Set(takenSlots), [takenSlots]);
  const firstFree = SLOTS.find((s) => !taken.has(s)) ?? SLOTS[0]!;
  const [selected, setSelected] = React.useState(firstFree);

  return (
    <>
      <h3 className="font-display mb-3 text-base font-bold text-ink">Today&apos;s Availability</h3>
      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map((slot) => {
          const isTaken = taken.has(slot);
          const isSelected = slot === selected;
          return (
            <button
              key={slot}
              type="button"
              disabled={isTaken}
              aria-pressed={isSelected}
              onClick={() => setSelected(slot)}
              className={cn(
                "h-10 rounded-xl text-xs font-bold transition-colors",
                isTaken
                  ? "cursor-not-allowed border border-dashed border-ink/15 text-ink/25 line-through"
                  : isSelected
                    ? "bg-primary text-ink"
                    : "bg-ink/[0.05] text-ink hover:bg-ink/[0.09]",
              )}
            >
              {slot}
            </button>
          );
        })}
      </div>

      {/* Sticky book bar */}
      <div className="sticky bottom-24 z-30 mt-6 md:bottom-6">
        <Button asChild variant="pop" size="lg" className="w-full">
          <Link href={`/booking/${courtId}?slot=${encodeURIComponent(selected)}`}>
            Book for {selected}
            {price !== null && ` · $${price}`}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
