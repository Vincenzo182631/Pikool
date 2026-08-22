"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/**
 * Rounded filter pill. Active = accent fill + bold; inactive = hairline
 * outline at 55% opacity. Press → scale 0.96.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active = false, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-[18px] text-sm tracking-[-0.01em] text-ink press press-chip",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary font-bold"
          : "border border-input font-semibold opacity-55 hover:opacity-100",
        className,
      )}
      {...props}
    />
  ),
);
Chip.displayName = "Chip";
