import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { enforceRateLimit } from "@/lib/rate-limit";
import { signUpload, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Return a signed Cloudinary upload payload for the current user. The client
 * uploads the file directly to Cloudinary using this signature.
 */
export const POST = route(async () => {
  const user = await requireUser();
  enforceRateLimit({ key: `media-sign:${user.id}`, limit: 30, windowMs: 60 * 1000 });

  if (!isCloudinaryConfigured) {
    throw new ApiError(
      "FORBIDDEN",
      "Image uploads are not configured. Add Cloudinary credentials to enable them.",
    );
  }

  // Timestamp is provided per-request; scoped to a per-user folder.
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = signUpload({ folder: `pikool/users/${user.id}`, timestamp });
  return ok(payload);
});
