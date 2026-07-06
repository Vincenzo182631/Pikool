"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PostComment } from "@/types/post";

export function PostComments({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.get<PostComment[]>(`/api/posts/${postId}/comments`),
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/posts/${postId}/comments`, { body: body.trim() });
      setBody("");
      await qc.invalidateQueries({ queryKey: ["comments", postId] });
      await qc.invalidateQueries({ queryKey: ["feed"] });
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't comment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <form onSubmit={add} className="flex gap-2">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a comment…" className="h-9" maxLength={500} />
        <Button type="submit" size="sm" loading={sending} disabled={!body.trim()}>
          Send
        </Button>
      </form>

      {isLoading ? (
        <div className="h-10 animate-pulse rounded-lg bg-secondary" />
      ) : (
        (comments ?? []).map((c) => (
          <div key={c.id} className="flex gap-2">
            <Avatar src={c.author.avatarUrl} fallback={c.author.initials} size={28} />
            <div className="rounded-xl bg-secondary/60 px-3 py-2">
              <p className="text-xs">
                <span className="font-medium">{c.author.name || (c.author.username ? `@${c.author.username}` : "Player")}</span>{" "}
                <span className="text-muted-foreground">· {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
              </p>
              <p className="text-sm">{c.body}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
