import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { POST_TYPE_META } from "@/lib/feed-meta";
import { PostDelete } from "@/components/admin/post-delete";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { email: true, firstName: true, lastName: true } },
      _count: { select: { reactions: true, comments: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Posts</h1>
      <p className="mb-4 text-sm text-muted-foreground">{posts.length} recent posts. Remove anything that breaks the rules.</p>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No posts yet.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const meta = POST_TYPE_META[p.type];
            const name = [p.author.firstName, p.author.lastName].filter(Boolean).join(" ") || p.author.email;
            return (
              <div key={p.id} className="flex items-start justify-between gap-3 rounded-3xl bg-card clay p-4">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    {meta && (
                      <Badge variant="secondary">
                        <meta.icon className="size-3" /> {meta.label}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {name} · {formatDistanceToNow(p.createdAt, { addSuffix: true })} · {p._count.reactions} likes · {p._count.comments} comments
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm">{p.body || "(no text)"}</p>
                </div>
                <PostDelete postId={p.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
