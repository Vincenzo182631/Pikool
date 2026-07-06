import "server-only";
import type { Prisma } from "@prisma/client";
import { initials } from "@/lib/utils";
import type { PostItem } from "@/types/post";

/** Prisma include shape for a feed post, personalized to `userId`. */
export function postInclude(userId: string) {
  return {
    author: { include: { profile: true } },
    _count: { select: { reactions: true, comments: true } },
    reactions: { where: { userId }, take: 1, select: { id: true } },
    bookmarks: { where: { userId }, take: 1, select: { id: true } },
  } satisfies Prisma.PostInclude;
}

type IncludedPost = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;

interface PollMeta {
  options?: string[];
  votes?: Record<string, number>;
  [k: string]: unknown;
}

export function serializePost(post: IncludedPost, userId: string): PostItem {
  const author = post.author;
  const meta = (post.meta ?? null) as PollMeta | null;

  let poll: PostItem["poll"] = null;
  if (post.type === "POLL" && Array.isArray(meta?.options)) {
    const votes = meta?.votes ?? {};
    const tally = meta.options.map((_, i) => Object.values(votes).filter((v) => v === i).length);
    const total = tally.reduce((a, b) => a + b, 0);
    poll = {
      options: meta.options.map((text, i) => ({
        text,
        votes: tally[i]!,
        pct: total ? Math.round((tally[i]! / total) * 100) : 0,
      })),
      totalVotes: total,
      myVote: userId in votes ? votes[userId]! : null,
    };
  }

  return {
    id: post.id,
    type: post.type,
    body: post.body,
    mediaUrls: post.mediaUrls,
    createdAt: post.createdAt.toISOString(),
    author: {
      name: [author.firstName, author.lastName].filter(Boolean).join(" "),
      username: author.profile?.username ?? null,
      avatarUrl: author.profile?.avatarUrl ?? null,
      initials: initials(author.firstName, author.lastName),
      skillLevel: author.profile?.skillLevel ?? null,
    },
    likeCount: post._count.reactions,
    commentCount: post._count.comments,
    likedByMe: post.reactions.length > 0,
    bookmarkedByMe: post.bookmarks.length > 0,
    isMine: post.authorId === userId,
    meta: meta
      ? {
          score: typeof meta.score === "string" ? meta.score : undefined,
          result: meta.result as "WIN" | "LOSS" | "DRAW" | undefined,
          rating: typeof meta.rating === "number" ? meta.rating : undefined,
          subject: typeof meta.subject === "string" ? meta.subject : undefined,
        }
      : null,
    poll,
  };
}
