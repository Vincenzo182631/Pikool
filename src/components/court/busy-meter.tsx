import { cn } from "@/lib/utils";
import type { BusyLevel } from "@/types/court";

const META: Record<BusyLevel, { label: string; dot: string; bars: number }> = {
  quiet: { label: "Quiet", dot: "bg-emerald-500", bars: 1 },
  moderate: { label: "Moderate", dot: "bg-amber-500", bars: 2 },
  busy: { label: "Busy", dot: "bg-rose-500", bars: 3 },
};

/** Compact live occupancy indicator (see docs/10). */
export function BusyMeter({
  level,
  count,
  className,
}: {
  level: BusyLevel;
  count?: number;
  className?: string;
}) {
  const m = META[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("w-1 rounded-sm", i <= m.bars ? m.dot : "bg-border")}
            style={{ height: `${i * 3 + 3}px` }}
          />
        ))}
      </span>
      <span>{m.label}</span>
      {count !== undefined && (
        <span className="text-muted-foreground">
          · {count} {count === 1 ? "player" : "players"}
        </span>
      )}
    </span>
  );
}
