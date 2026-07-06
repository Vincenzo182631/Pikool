import { z } from "zod";

export const SKILL_LEVELS = [
  "L2_0",
  "L2_5",
  "L3_0",
  "L3_5",
  "L4_0",
  "L4_5",
  "L5_0",
  "L5_5",
] as const;

export const PLAY_FORMATS = ["SINGLES", "DOUBLES", "MIXED"] as const;
export const DOMINANT_HANDS = ["LEFT", "RIGHT", "AMBIDEXTROUS"] as const;

export const onboardingSchema = z.object({
  firstName: z.string().min(1, "Required").max(50),
  lastName: z.string().min(1, "Required").max(50),
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  skillLevel: z.enum(SKILL_LEVELS),
  dominantHand: z.enum(DOMINANT_HANDS),
  playingStyle: z.string().max(60).optional(),
  yearsPlaying: z.number().int().min(0).max(80),
  favoritePaddle: z.string().max(80).optional(),
  formats: z.array(z.enum(PLAY_FORMATS)).min(1, "Pick at least one format"),
});

export const updateProfileSchema = onboardingSchema.partial().extend({
  bio: z.string().max(280).optional(),
  avatarUrl: z.url().optional(),
  coverUrl: z.url().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
