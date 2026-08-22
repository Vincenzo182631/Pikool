import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Inline `★ 4.7` — the star is always filled gold. */
export function Rating({
  value,
  className,
}: {
  value: number | string;
  className?: string;
}) {
  const shown = typeof value === "number" ? value.toFixed(1) : value;
  return (
    <span
      className={cn("inline-flex items-center gap-[3px] text-xs font-bold text-ink", className)}
    >
      <Star className="size-[13px] fill-star text-star" strokeWidth={2.2} />
      {shown}
    </span>
  );
}

/** Small price compound — the unit is dimmed to 50%. */
export function PriceTag({
  amount,
  unit = "/hr",
  className,
}: {
  amount: number | string;
  unit?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1 rounded-lg bg-ink/[0.06] px-2 text-[11px] font-bold tracking-[-0.01em] text-ink",
        className,
      )}
    >
      {typeof amount === "number" ? `$${amount}` : amount}
      {unit && <span className="opacity-50">{unit}</span>}
    </span>
  );
}

/** Row-level heading: Fraunces italic label + optional right-side action. */
export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-baseline justify-between gap-3", className)}>
      <h2 className="font-display text-[22px] font-bold text-ink">{children}</h2>
      {action}
    </div>
  );
}

/** Uppercase eyebrow used above grouped sections (TODAY / EARLIER). */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
