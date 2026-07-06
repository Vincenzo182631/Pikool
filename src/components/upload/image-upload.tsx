"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface SignPayload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}

/**
 * Reusable image uploader backed by signed Cloudinary uploads. Falls back to a
 * URL input when Cloudinary isn't configured, so the flow always works.
 */
export function ImageUpload({
  value,
  onChange,
  variant = "square",
  label = "Upload image",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  variant?: "square" | "cover";
  label?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [urlMode, setUrlMode] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const sign = await api.post<SignPayload>("/api/media/sign");
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sign.apiKey);
      body.append("timestamp", String(sign.timestamp));
      body.append("signature", sign.signature);
      body.append("folder", sign.folder);

      const res = await fetch(sign.uploadUrl, { method: "POST", body });
      if (!res.ok) throw new Error("Upload failed");
      const data = (await res.json()) as { secure_url: string };
      onChange(data.secure_url);
      toast.success("Image uploaded");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "FORBIDDEN") {
        setUrlMode(true);
        toast.message("Image uploads aren't configured — paste an image URL instead.");
      } else {
        toast.error("Couldn't upload image.");
      }
    } finally {
      setUploading(false);
    }
  }

  const isCover = variant === "cover";

  if (urlMode) {
    return (
      <div className="space-y-1.5">
        <input
          type="url"
          placeholder="https://…/image.jpg"
          defaultValue={value ?? ""}
          onBlur={(e) => onChange(e.target.value || null)}
          className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          className="text-xs text-muted-foreground hover:underline"
          onClick={() => setUrlMode(false)}
        >
          Use file upload instead
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={label}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden border border-dashed border-input bg-secondary text-muted-foreground transition-colors hover:border-primary hover:text-primary",
          isCover ? "h-32 w-full rounded-xl" : "size-24 rounded-full",
        )}
      >
        {value ? (
          <Image src={value} alt="" fill className="object-cover" sizes="200px" />
        ) : uploading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            <ImagePlus className="size-5" />
            {isCover ? "Cover" : "Photo"}
          </span>
        )}
        {uploading && value && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="size-6 animate-spin text-white" />
          </span>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <X className="size-3" /> Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
