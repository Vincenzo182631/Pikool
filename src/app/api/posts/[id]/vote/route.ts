import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { voteSchema } from "@/lib/validation/post";

export const runtime = "nodejs";

/** Cast (or change) a vote on a poll post. Votes live in Post.meta.votes. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const { option } = voteSchema.parse(await req.json());

  const result = await db.$transaction(async (tx) => {
    const post = await tx.post.findUnique({ where: { id }, select: { type: true, meta: true } });
    if (!post || post.type !== "POLL") {
      throw new ApiError("NOT_FOUND", "Poll not found.");
    }
    const meta = (post.meta ?? {}) as { options?: string[]; votes?: Record<string, number> };
    const options = meta.options ?? [];
    if (option >= options.length) throw new ApiError("VALIDATION_ERROR", "Invalid option.");

    const votes = { ...(meta.votes ?? {}), [user.id]: option };
    await tx.post.update({ where: { id }, data: { meta: { ...meta, votes } } });

    const tally = options.map((_, i) => Object.values(votes).filter((v) => v === i).length);
    const total = tally.reduce((a, b) => a + b, 0);
    return {
      options: options.map((text, i) => ({
        text,
        votes: tally[i]!,
        pct: total ? Math.round((tally[i]! / total) * 100) : 0,
      })),
      totalVotes: total,
      myVote: option,
    };
  });

  return ok(result);
});
