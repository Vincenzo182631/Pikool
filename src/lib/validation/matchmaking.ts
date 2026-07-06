import { z } from "zod";
import { PLAY_FORMATS, SKILL_LEVELS } from "@/lib/validation/user";

/** Broadcast an "I'm available to play" signal. */
export const broadcastSchema = z.object({
  format: z.enum(PLAY_FORMATS),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z.number().positive().max(100).default(15),
  durationMins: z.number().int().min(30).max(720).default(180),
});

/** Query nearby available players. */
export const playersQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(200).default(25),
  format: z.enum(PLAY_FORMATS).optional(),
  minSkill: z.enum(SKILL_LEVELS).optional(),
  maxSkill: z.enum(SKILL_LEVELS).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(60),
});

/** Send a play invite to another player. */
export const createRequestSchema = z.object({
  toUserId: z.string().min(1),
  format: z.enum(PLAY_FORMATS).default("DOUBLES"),
  courtId: z.string().min(1).optional(),
  message: z.string().trim().max(300).optional(),
  proposedAt: z.string().datetime().optional(),
});

/** Respond to (or cancel) a play invite. */
export const respondRequestSchema = z.object({
  action: z.enum(["accept", "decline", "cancel"]),
});

export type BroadcastInput = z.infer<typeof broadcastSchema>;
export type PlayersQuery = z.infer<typeof playersQuerySchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
