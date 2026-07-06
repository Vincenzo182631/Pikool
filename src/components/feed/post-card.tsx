"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Flag, Trophy } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Avatar } from "@/components/ui/avatar";
import { RatingBadge } from "@/components/ui/rating-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Stars } from "@/components/court/star-rating";
import { POST_TYPE_META } from "@/lib/feed-meta";
import { cn } from "@/lib/utils";
import type { PostItem, PollOption } from "@/types/post";

export function PostCard({ post }: { post: PostItem }) {
  const qc = useQueryClient();
  const [liked, setLiked] = React.useState(post.likedByMe);
  const [likeCount, setLikeCount] = React.useState(post.likeCount);
  const [saved, setSaved] = React.useState(post.bookmarkedByMe);
  const [showComments, setShowComments] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [poll, setPoll] = React.useState(post.poll);

  const meta = POST_TYPE_META[post.type];
  const Comments = React.useMemo(
    () => React.lazy(() => import("@/components/feed/post-comments").then((m) => ({ default: m.PostComments }))),
    [],
  );

  if (deleted) return null;

  async function toggleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const r = await api.post<{ liked: boolean; likeCount: number }>(`/api/posts/${post.id}/react`);
      setLiked(r.liked);
      setLikeCount(r.likeCount);
    } catch {
      setLiked(post.likedByMe);
      setLikeCount(post.likeCount);
    }
  }

  async function toggleSave() {
    setSaved((v) => !v);
    try {
      const r = await api.post<{ bookmarked: boolean }>(`/api/posts/${post.id}/bookmark`);
      setSaved(r.bookmarked);
    } catch {
      setSaved(post.bookmarkedByMe);
    }
  }

  async function share() {
    const url = `${window.location.origin}/feed#${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: "PicklePlay post" });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* cancelled */
    }
  }

  async function vote(i: number) {
    try {
      const r = await api.post<{ options: PollOption[]; totalVotes: number; myVote: number }>(`/api/posts/${post.id}/vote`, { option: i });
      setPoll(r);
    } catch {
      toast.error("Couldn't record your vote.");
    }
  }

  async function remove() {
    try {
      await api.del(`/api/posts/${post.id}`);
      setDeleted(true);
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't delete.");
    }
  }

  async function report() {
    setMenuOpen(false);
    try {
      await api.post(`/api/posts/${post.id}/report`, { reason: "Reported from feed" });
      toast.success("Thanks — we'll take a look.");
    } catch {
      toast.error("Couldn't report.");
    }
  }

  return (
    <article id={post.id} className="rounded-3xl bg-card clay p-4">
      {/* header */}
      <div className="flex items-start gap-3">
        <Avatar src={post.author.avatarUrl} fallback={post.author.initials} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {post.author.username ? (
              <Link href={`/players/${post.author.username}`} className="font-semibold hover:underline">
                {post.author.name || `@${post.author.username}`}
              </Link>
            ) : (
              <span className="font-semibold">{post.author.name || "Player"}</span>
            )}
            {post.author.skillLevel && <RatingBadge level={post.author.skillLevel} />}
            <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
          {meta && (
            <span
              className={cn(
                "mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold clay-sm",
                meta.tone,
              )}
            >
              <meta.icon className="size-3" />
              {meta.label}
            </span>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Post menu" className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-border bg-popover p-1 text-sm shadow-md" onMouseLeave={() => setMenuOpen(false)}>
              {post.isMine ? (
                <button onClick={remove} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-destructive hover:bg-secondary">
                  <Trash2 className="size-4" /> Delete
                </button>
              ) : (
                <button onClick={report} className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-secondary">
                  <Flag className="size-4" /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* body */}
      {post.body && <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{post.body}</p>}

      {/* welcome — invite the community to say hi */}
      {post.type === "WELCOME" && !post.isMine && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            🎉 Give {post.author.name ? post.author.name.split(" ")[0] : "them"} a warm welcome to the community!
          </p>
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full grad-cta px-4 py-1.5 text-sm font-semibold text-[#3b1e8f] clay-sm clay-pressable"
          >
            Say hi 👋
          </button>
        </div>
      )}

      {/* match result */}
      {post.type === "MATCH_RESULT" && (post.meta?.result || post.meta?.score) && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
          <Trophy className="size-4 text-primary" />
          {post.meta.result && (
            <span className={cn("text-sm font-bold", post.meta.result === "WIN" ? "text-emerald-500" : "text-rose-500")}>
              {post.meta.result === "WIN" ? "Win" : post.meta.result === "LOSS" ? "Loss" : "Draw"}
            </span>
          )}
          {post.meta.score && <span className="text-sm tabular-nums text-muted-foreground">{post.meta.score}</span>}
        </div>
      )}

      {/* review */}
      {(post.type === "COURT_REVIEW" || post.type === "PADDLE_REVIEW") && (post.meta?.rating || post.meta?.subject) && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
          {post.meta.rating ? <Stars value={post.meta.rating} /> : null}
          {post.meta.subject && <span className="text-sm font-medium">{post.meta.subject}</span>}
        </div>
      )}

      {/* poll */}
      {poll && (
        <div className="mt-3 space-y-2">
          {poll.options.map((o, i) => {
            const voted = poll.myVote !== null;
            return (
              <button
                key={i}
                type="button"
                disabled={voted}
                onClick={() => vote(i)}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  poll.myVote === i ? "border-primary" : "border-border",
                  !voted && "hover:bg-secondary",
                )}
              >
                {voted && <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${o.pct}%` }} />}
                <span className="relative flex items-center justify-between">
                  <span className="font-medium">{o.text}</span>
                  {voted && <span className="text-xs text-muted-foreground">{o.pct}%</span>}
                </span>
              </button>
            );
          })}
          <p className="text-xs text-muted-foreground">
            {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
          </p>
        </div>
      )}

      {/* media */}
      {post.mediaUrls.length > 0 && (
        <div className={cn("mt-3 grid gap-2 overflow-hidden rounded-xl", post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {post.mediaUrls.map((url) => (
            <div key={url} className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
              <SmartImage src={url} alt="" fill className="object-cover" sizes="600px" />
            </div>
          ))}
        </div>
      )}

      {/* actions */}
      <div className="mt-3 flex items-center gap-1 border-t border-border pt-2 text-sm text-muted-foreground">
        <button onClick={toggleLike} className={cn("flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-secondary", liked && "text-rose-500")}>
          <Heart className={cn("size-4", liked && "fill-rose-500")} /> {likeCount > 0 && likeCount}
          <span className="sr-only">Like</span>
        </button>
        <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-secondary">
          <MessageCircle className="size-4" /> {post.commentCount > 0 && post.commentCount}
          <span className="sr-only">Comment</span>
        </button>
        <button onClick={share} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-secondary">
          <Share2 className="size-4" />
          <span className="sr-only">Share</span>
        </button>
        <button onClick={toggleSave} className={cn("ml-auto flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-secondary", saved && "text-primary")}>
          <Bookmark className={cn("size-4", saved && "fill-primary")} />
          <span className="sr-only">Bookmark</span>
        </button>
      </div>

      {showComments && (
        <React.Suspense fallback={<div className="mt-3 h-10 animate-pulse rounded-lg bg-secondary" />}>
          <Comments postId={post.id} />
        </React.Suspense>
      )}
    </article>
  );
}
