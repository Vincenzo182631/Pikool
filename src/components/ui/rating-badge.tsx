import { SKILL_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Skill-level chip (2.0–5.5). See docs/12-player-rating.md. */
export function RatingBadge({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  const meta = SKILL_META[level] ?? { label: "Unrated", value: "–" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground",
        className,
      )}
      title={`${meta.value} · ${meta.label}`}
    >
      <span className="tabular-nums">{meta.value}</span>
      <span className="opacity-70">{meta.label}</span>
    </span>
  );
}
