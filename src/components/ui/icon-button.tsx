import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type IconButtonVariant = "default" | "filled" | "dark";

const VARIANTS: Record<IconButtonVariant, string> = {
  /** White surface with a hairline ring — the default overlay/header button. */
  default: "bg-card text-ink shadow-icon",
  /** Accent fill — marks an active/engaged state (e.g. filters open). */
  filled: "bg-primary text-ink shadow-[0_4px_14px_rgba(184,218,30,0.35)]",
  /** Ink fill — used over photography and for bookmark actions. */
  dark: "bg-ink text-white shadow-soft",
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  /** Diameter in px (default 44, per the handoff). */
  size?: number;
  asChild?: boolean;
}

/** Circular icon button. Press → scale 0.93. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "default", size = 44, asChild, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        style={{ width: size, height: size, ...style }}
        className={cn(
          "inline-grid shrink-0 place-items-center rounded-full press press-icon",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          VARIANTS[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";
