import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/** Soft pastel tones for clay icon tiles (theme-aware). */
export const CLAY_TONES = {
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
  royal: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
  coral: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
  sunset: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300",
  peach: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
  cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300",
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
  lime: "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
} as const;

export type ClayTone = keyof typeof CLAY_TONES;

const SIZES = {
  sm: { box: "size-9 rounded-2xl", icon: "size-4" },
  md: { box: "size-11 rounded-2xl", icon: "size-5" },
  lg: { box: "size-14 rounded-[1.25rem]", icon: "size-7" },
  xl: { box: "size-16 rounded-[1.4rem]", icon: "size-8" },
} as const;

/**
 * A puffy, raised clay tile housing a lucide icon — the icon language that
 * matches the claymorphism surfaces. Colorful but professional.
 */
export function ClayIcon({
  icon: Icon,
  tone = "violet",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: ClayTone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-grid shrink-0 place-items-center clay-sm", s.box, CLAY_TONES[tone], className)}>
      <Icon className={s.icon} />
    </span>
  );
}
