import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Tones for a squircle icon tile. The editorial system is near-monochrome —
 * accent is reserved for emphasis, so most tiles are `gray`.
 */
export const TILE_TONES = {
  accent: "bg-primary text-ink",
  dark: "bg-ink text-primary",
  gray: "bg-ink/[0.06] text-ink",
} as const;

export type TileTone = keyof typeof TILE_TONES;

const SIZES = {
  sm: { box: "size-[34px] rounded-xl", icon: "size-4" },
  md: { box: "size-11 rounded-2xl", icon: "size-5" },
  lg: { box: "size-14 rounded-[18px]", icon: "size-6" },
} as const;

/** Icon in a soft rounded tile — used in notification rows and empty states. */
export function IconTile({
  icon: Icon,
  tone = "gray",
  size = "sm",
  className,
}: {
  icon: LucideIcon;
  tone?: TileTone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-grid shrink-0 place-items-center", s.box, TILE_TONES[tone], className)}>
      <Icon className={s.icon} strokeWidth={1.8} />
    </span>
  );
}
