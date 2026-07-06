import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { enforceRateLimit } from "@/lib/rate-limit";
import { commentSchema } from "@/lib/validation/post";
import { initials } from "@/lib/utils";
import type { PostComment } from "@/types/post";

export const runtime = "nodejs";

function serialize(
  c: {
    id: string;
    body: string;
    createdAt: Date;
    authorId: string;
    author: { firstName: string | null; lastName: string | null; profile: { username: string; avatarUrl: string | null; skillLevel: string } | null };
  },
  userId: string,
): PostComment {
  return {
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    isMine: c.authorId === userId,
    author: {
      name: [c.author.firstName, c.author.lastName].filter(Boolean).join(" "),
      username: c.author.profile?.username ?? null,
      avatarUrl: c.author.profile?.avatarUrl ?? null,
      initials: initials(c.author.firstName, c.author.lastName),
      skillLevel: c.author.profile?.skillLevel ?? null,
    },
  };
}

export const GET = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const comments = await db.comment.findMany({
    where: { postId: id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { author: { include: { profile: true } } },
  });
  return ok(comments.map((c) => serialize(c, user.id)));
});

export const POST = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  enforceRateLimit({ key: `comment:${user.id}`, limit: 30, windowMs: 60 * 1000 });

  const input = commentSchema.parse(await req.json());
  const created = await db.comment.create({
    data: { postId: id, authorId: user.id, body: input.body },
    include: { author: { include: { profile: true } } },
  });
  return ok(serialize(created, user.id), { status: 201 });
});
