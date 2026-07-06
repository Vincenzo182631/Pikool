import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { postInclude, serializePost } from "@/lib/services/post";
import { PostCard } from "@/components/feed/post-card";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const post = await db.post.findUnique({ where: { id }, include: postInclude(user.id) });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to feed
      </Link>
      {post.deletedAt ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          This post has been removed.
        </div>
      ) : (
        <PostCard post={serializePost(post, user.id)} />
      )}
    </div>
  );
}
