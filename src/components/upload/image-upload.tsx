"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

interface SignPayload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}

/** Downscale + JPEG-compress an image in the browser. */
async function compress(
  file: File,
  maxDim: number,
  quality = 0.72,
): Promise<{ blob: Blob; dataUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("compress failed"))), "image/jpeg", quality),
  );
  return { blob, dataUrl };
}

/**
 * Image uploader that always works: compresses in-browser, then uploads to
 * Cloudinary when it's configured, otherwise stores the compact image inline
 * (data URL). No external account required to get started.
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
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isCover = variant === "cover";
  const maxDim = isCover ? 1200 : 512;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setBusy(true);
    try {
      const { blob, dataUrl } = await compress(file, maxDim);

      // Try Cloudinary if configured; fall back to the inline data URL.
      try {
        const sign = await api.post<SignPayload>("/api/media/sign");
        const body = new FormData();
        body.append("file", blob);
        body.append("api_key", sign.apiKey);
        body.append("timestamp", String(sign.timestamp));
        body.append("signature", sign.signature);
        body.append("folder", sign.folder);
        const res = await fetch(sign.uploadUrl, { method: "POST", body });
        if (!res.ok) throw new Error("cloudinary upload failed");
        const data = (await res.json()) as { secure_url: string };
        onChange(data.secure_url);
      } catch (err) {
        if (err instanceof ApiClientError && err.code === "FORBIDDEN") {
          onChange(dataUrl); // no storage provider configured — store inline
        } else {
          onChange(dataUrl); // any upload failure: keep the compressed image
        }
      }
      toast.success("Image added");
    } catch {
      toast.error("Couldn't process that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={label}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden border border-dashed border-input bg-secondary text-muted-foreground transition-colors hover:border-primary hover:text-primary",
          isCover ? "h-32 w-full rounded-xl" : "size-24 rounded-full",
        )}
      >
        {value ? (
          <SmartImage src={value} alt="" fill className="object-cover" sizes="400px" />
        ) : busy ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            <ImagePlus className="size-5" />
            {isCover ? "Cover" : "Photo"}
          </span>
        )}
        {busy && value && (
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
