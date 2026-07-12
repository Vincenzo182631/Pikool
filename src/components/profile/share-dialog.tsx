"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Share a player profile: shows a scannable QR code plus copy / native-share
 * actions. The URL is resolved on the client so the QR always points at the
 * current origin.
 */
export function ShareProfile({ username, displayName }: { username: string; displayName: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState(`/players/${username}`);

  React.useEffect(() => {
    setUrl(`${window.location.origin}/players/${username}`);
  }, [username]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Profile link copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  async function nativeShare() {
    try {
      if (navigator.share) await navigator.share({ title: `${displayName} on PicklePlay`, url });
      else await copy();
    } catch {
      /* cancelled */
    }
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)} aria-label="Share profile">
        <Share2 />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Share ${displayName}'s profile`}
          >
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 clay"
              initial={{ scale: 0.94, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="size-4" />
              </button>

              <h2 className="text-lg font-bold tracking-tight">Share profile</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Scan the code or copy the link to share @{username}.
              </p>

              <div className="mt-5 flex justify-center">
                <div className="rounded-3xl bg-white p-4 clay-sm">
                  <QRCodeSVG
                    value={url}
                    size={188}
                    marginSize={0}
                    level="M"
                    fgColor="#3b1e8f"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-secondary/60 px-3 py-2 clay-inset">
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{url}</span>
                <button
                  onClick={copy}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold clay-sm clay-pressable"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <Button className="mt-4 w-full" onClick={nativeShare}>
                <Share2 /> Share
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
