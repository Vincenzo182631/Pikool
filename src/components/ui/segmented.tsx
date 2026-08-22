"use client";

import { cn } from "@/lib/utils";

/**
 * Two-or-more-item segmented control. Active pill is ink-filled with accent
 * text — used on Home (Upcoming/Match), Matches, and Events.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "sm",
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-full bg-ink/[0.06] p-[3px]", className)}
    >
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full transition-all duration-[180ms]",
              size === "sm" ? "px-3 py-[5px] text-xs" : "px-4 py-2 text-sm",
              active
                ? "bg-ink font-bold text-primary shadow-soft"
                : "font-semibold text-muted-foreground hover:text-ink",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
