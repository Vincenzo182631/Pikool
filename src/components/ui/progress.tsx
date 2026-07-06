import { cn } from "@/lib/utils";

/** Simple accessible progress bar. */
export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-secondary clay-inset", className)}
    >
      <div
        className="h-full rounded-full bg-primary clay-sm transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
