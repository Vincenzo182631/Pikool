import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createPostSchema } from "@/lib/validation/post";
import { postInclude, serializePost } from "@/lib/services/post";

export const runtime = "nodejs";

/** Personalized-ish feed: most recent posts (global for now), paginated. */
export const GET = route(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50);

  const posts = await db.post.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: postInclude(user.id),
  });

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;

  return ok(
    page.map((p) => serializePost(p, user.id)),
    { meta: { nextCursor: hasMore ? page[page.length - 1]!.id : null, hasMore } },
  );
});

/** Create a post. */
export const POST = route(async (req: Request) => {
  const user = await requireUser();
  enforceRateLimit({ key: `post:${user.id}`, limit: 20, windowMs: 60 * 1000 });

  const input = createPostSchema.parse(await req.json());

  const meta: Prisma.InputJsonValue = {
    ...(input.meta ?? {}),
    ...(input.type === "POLL" ? { options: input.meta?.options ?? [], votes: {} } : {}),
  };

  const created = await db.post.create({
    data: {
      authorId: user.id,
      type: input.type,
      body: input.body,
      mediaUrls: input.mediaUrls ?? [],
      meta,
    },
    include: postInclude(user.id),
  });

  return ok(serializePost(created, user.id), { status: 201 });
});
