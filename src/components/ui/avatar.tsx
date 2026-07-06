import * as React from "react";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: number;
  className?: string;
}

/** Circular avatar with graceful initials fallback. */
export function Avatar({ src, alt = "", fallback = "?", size = 40, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <SmartImage src={src} alt={alt} width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-semibold text-muted-foreground"
          style={{ fontSize: size * 0.4 }}
        >
          {fallback}
        </span>
      )}
    </span>
  );
}
