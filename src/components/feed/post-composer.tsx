"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { useMe } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/upload/image-upload";
import { StarInput } from "@/components/court/star-rating";
import { COMPOSER_TYPES, POST_TYPE_META } from "@/lib/feed-meta";
import { createPostSchema } from "@/lib/validation/post";
import { cn } from "@/lib/utils";

const inputCls =
  "h-9 flex-1 rounded-2xl border border-border/60 bg-secondary/60 clay-inset px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PostComposer() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [type, setType] = React.useState<string>("TRAINING_TIP");
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  // type-specific
  const [score, setScore] = React.useState("");
  const [result, setResult] = React.useState<"WIN" | "LOSS" | "">("");
  const [subject, setSubject] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const [options, setOptions] = React.useState<string[]>(["", ""]);
  const [photo, setPhoto] = React.useState<string | null>(null);

  const placeholder =
    type === "POLL"
      ? "Ask the community something…"
      : type === "MATCH_RESULT"
        ? "How did the match go?"
        : "Share a tip, result, or update with the community…";

  async function submit() {
    const meta: Record<string, unknown> = {};
    if (type === "MATCH_RESULT") {
      if (score) meta.score = score;
      if (result) meta.result = result;
    }
    if (type === "COURT_REVIEW" || type === "PADDLE_REVIEW") {
      if (subject) meta.subject = subject;
      if (rating) meta.rating = rating;
    }
    if (type === "POLL") meta.options = options.map((o) => o.trim()).filter(Boolean);

    const payload = {
      type,
      body: body.trim() || undefined,
      mediaUrls: type === "PHOTO" && photo ? [photo] : undefined,
      meta: Object.keys(meta).length ? meta : undefined,
    };
    const parsed = createPostSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Add some content.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/posts", parsed.data);
      await qc.invalidateQueries({ queryKey: ["feed"] });
      // reset
      setBody("");
      setScore("");
      setResult("");
      setSubject("");
      setRating(0);
      setOptions(["", ""]);
      setPhoto(null);
      setType("TRAINING_TIP");
      toast.success("Posted!");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-card clay p-4">
      <div className="flex gap-3">
        <Avatar src={me?.profile?.avatarUrl} fallback={me?.profile ? me.profile.username[0]!.toUpperCase() : "?"} size={40} />
        <div className="flex-1 space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            className="min-h-16 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            maxLength={1000}
          />

          {/* type-specific inputs */}
          {type === "MATCH_RESULT" && (
            <div className="flex flex-wrap items-center gap-2">
              {(["WIN", "LOSS"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(result === r ? "" : r)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    result === r
                      ? r === "WIN"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
                        : "border-rose-500 bg-rose-500/15 text-rose-500"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {r === "WIN" ? "Win" : "Loss"}
                </button>
              ))}
              <input className={inputCls} placeholder="Score, e.g. 11-7, 11-9" value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
          )}
          {(type === "COURT_REVIEW" || type === "PADDLE_REVIEW") && (
            <div className="flex flex-wrap items-center gap-3">
              <input className={inputCls} placeholder={type === "COURT_REVIEW" ? "Which court?" : "Which paddle?"} value={subject} onChange={(e) => setSubject(e.target.value)} />
              <StarInput value={rating} onChange={setRating} />
            </div>
          )}
          {type === "POLL" && (
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={o} onChange={(e) => setOptions((p) => p.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} className="h-9" />
                  {options.length > 2 && (
                    <button type="button" onClick={() => setOptions((p) => p.filter((_, j) => j !== i))} aria-label="Remove option">
                      <X className="size-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 4 && (
                <button type="button" onClick={() => setOptions((p) => [...p, ""])} className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <Plus className="size-3.5" /> Add option
                </button>
              )}
            </div>
          )}
          {type === "PHOTO" && (
            <ImageUpload variant="cover" value={photo} onChange={setPhoto} label="Add a photo" />
          )}

          {/* type chips */}
          <div className="flex flex-wrap gap-1.5">
            {COMPOSER_TYPES.map((t) => {
              const m = POST_TYPE_META[t]!;
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    active ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <m.icon className="size-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={submit} loading={loading}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
