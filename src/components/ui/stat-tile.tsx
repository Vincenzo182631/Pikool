import { cn } from "@/lib/utils";

/**
 * Labeled metric. The number uses the display face (Fraunces italic) — that
 * editorial treatment of numerals is core to the brand.
 */
export function StatTile({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-card px-3 py-3.5 text-center shadow-card", className)}>
      <p className="font-display text-2xl font-extrabold leading-none text-ink">{value}</p>
      <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
