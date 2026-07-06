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

export const AVAILABILITY_OPTIONS = [
  { value: "WEEKDAY_MORNINGS", label: "Weekday mornings" },
  { value: "WEEKDAY_AFTERNOONS", label: "Weekday afternoons" },
  { value: "WEEKDAY_EVENINGS", label: "Weekday evenings" },
  { value: "WEEKENDS", label: "Weekends" },
] as const;

const AVAILABILITY_VALUES = AVAILABILITY_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

const usernameSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(24)
  .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only");

/** Onboarding — everything collected after first login (names are set at signup). */
export const onboardingSchema = z.object({
  username: usernameSchema,
  displayName: z.string().min(1, "Required").max(40).optional(),
  avatarUrl: z.url().optional(),
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  skillLevel: z.enum(SKILL_LEVELS),
  dominantHand: z.enum(DOMINANT_HANDS),
  playingStyle: z.string().max(60).optional(),
  yearsPlaying: z.number().int().min(0).max(80),
  favoritePaddle: z.string().max(80).optional(),
  formats: z.array(z.enum(PLAY_FORMATS)).min(1, "Pick at least one format"),
  availability: z.array(z.enum(AVAILABILITY_VALUES)).optional(),
  bio: z.string().max(280).optional(),
});

/** Edit profile — all optional; can also update the account's real name. */
export const updateProfileSchema = onboardingSchema.partial().extend({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  coverUrl: z.url().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
