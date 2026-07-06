"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Stars, StarInput } from "@/components/court/star-rating";
import type { CourtReview } from "@/types/court";

export function CourtReviews({
  courtId,
  reviews,
  canReview,
}: {
  courtId: string;
  reviews: CourtReview[];
  canReview: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Pick a star rating.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/courts/${courtId}/reviews`, { rating, body: body || undefined });
      toast.success("Thanks for your review!");
      setOpen(false);
      setRating(0);
      setBody("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't submit review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {canReview && !open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Write a review
          </Button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4">
          <StarInput value={rating} onChange={setRating} />
          <Textarea
            placeholder="How were the courts? Nets, surface, lighting, crowd…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={loading}>
              Post review
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews yet.{canReview ? " Be the first to review this court." : ""}
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="flex gap-3">
              <Avatar src={r.author.avatarUrl} fallback={r.author.initials} size={36} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.author.name || "Player"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <Stars value={r.rating} className="my-1" />
                {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
