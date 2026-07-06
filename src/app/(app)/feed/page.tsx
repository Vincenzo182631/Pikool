"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";
import { ClayIcon } from "@/components/ui/clay-icon";
import { apiPage } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";
import type { PostItem } from "@/types/post";

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) =>
      apiPage<PostItem[]>(`/api/posts?limit=20${pageParam ? `&cursor=${pageParam}` : ""}`),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
  });

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Feed" description="What's happening in your pickleball community." />

      <div className="space-y-4">
        <PostComposer />

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />
          ))
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <ClayIcon icon={Newspaper} tone="violet" size="lg" className="mx-auto mb-3" />
            <p className="font-medium">The feed is quiet</p>
            <p className="text-sm text-muted-foreground">Be the first to post a tip, result, or poll above.</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasNextPage && (
              <div className="flex justify-center pb-6">
                <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
