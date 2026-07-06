import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renders inline data: URLs with a plain <img> (next/image's optimizer rejects
 * data URLs) and hosted URLs via next/image. Lets uploaded images work whether
 * they're compressed data URLs (zero-config) or Cloudinary URLs.
 */
type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
} & ({ fill: true; width?: never; height?: never } | { fill?: false; width: number; height: number });

export function SmartImage({ src, alt = "", className, sizes, fill, width, height }: Props) {
  const isData = src.startsWith("data:");

  if (isData) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)}
        {...(fill ? {} : { width, height })}
      />
    );
  }

  return fill ? (
    <Image src={src} alt={alt} fill sizes={sizes} className={className} />
  ) : (
    <Image src={src} alt={alt} width={width!} height={height!} className={className} />
  );
}
