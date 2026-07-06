import { z } from "zod";

export const POST_TYPES = [
  "TRAINING_TIP",
  "MATCH_RESULT",
  "COURT_REVIEW",
  "PADDLE_REVIEW",
  "GAME_INVITE",
  "TOURNAMENT_NEWS",
  "PHOTO",
  "POLL",
] as const;

export type PostTypeValue = (typeof POST_TYPES)[number];

/** Type-specific composer metadata. */
export const postMetaSchema = z
  .object({
    score: z.string().max(40).optional(), // MATCH_RESULT, e.g. "11-7, 11-9"
    result: z.enum(["WIN", "LOSS", "DRAW"]).optional(),
    rating: z.number().int().min(1).max(5).optional(), // COURT/PADDLE_REVIEW
    subject: z.string().max(120).optional(), // court/paddle name
    options: z.array(z.string().trim().min(1).max(80)).min(2).max(4).optional(), // POLL
  })
  .optional();

export const createPostSchema = z
  .object({
    type: z.enum(POST_TYPES),
    body: z.string().trim().max(1000).optional(),
    mediaUrls: z.array(z.url()).max(4).optional(),
    meta: postMetaSchema,
  })
  .refine(
    (d) => {
      if (d.type === "POLL") return (d.meta?.options?.length ?? 0) >= 2;
      if (d.type === "PHOTO") return (d.mediaUrls?.length ?? 0) >= 1;
      return Boolean(d.body && d.body.length > 0);
    },
    { message: "Add some content to your post.", path: ["body"] },
  );

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Write a comment").max(500),
});

export const reportSchema = z.object({
  reason: z.string().trim().min(3, "Tell us why").max(300),
});

export const voteSchema = z.object({
  option: z.number().int().min(0).max(3),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
