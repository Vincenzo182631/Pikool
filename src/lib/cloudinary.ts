import { createHash } from "crypto";
import { env, isCloudinaryConfigured } from "@/lib/env";

export { isCloudinaryConfigured };

/**
 * Build a signed Cloudinary upload payload. The browser uploads bytes directly
 * to Cloudinary with this signature (the server never proxies the file — see
 * docs/06). Signature = sha1 of the sorted params + api_secret.
 */
export function signUpload(params: { folder: string; timestamp: number }) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }
  const toSign = `folder=${params.folder}&timestamp=${params.timestamp}`;
  const signature = createHash("sha1")
    .update(`${toSign}${env.cloudinaryApiSecret}`)
    .digest("hex");

  return {
    signature,
    timestamp: params.timestamp,
    apiKey: env.cloudinaryApiKey,
    cloudName: env.cloudinaryCloudName,
    folder: params.folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
  };
}
