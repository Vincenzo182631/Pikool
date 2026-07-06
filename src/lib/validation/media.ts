import { z } from "zod";

/**
 * An image reference: either a hosted http(s) URL (e.g. Cloudinary) or a
 * compressed inline data: URL (the zero-config fallback when no storage
 * provider is configured). Capped to keep DB rows reasonable.
 */
export const imageRefSchema = z
  .string()
  .max(3_000_000, "Image is too large")
  .refine(
    (v) => /^https?:\/\//.test(v) || /^data:image\/(png|jpe?g|webp);base64,/.test(v),
    "Must be an image URL or uploaded image",
  );
