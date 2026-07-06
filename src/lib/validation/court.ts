import { z } from "zod";

export const COURT_SURFACES = ["CONCRETE", "ASPHALT", "ACRYLIC", "WOOD", "OTHER"] as const;
export const COURT_ENVIRONMENTS = ["INDOOR", "OUTDOOR"] as const;

/** Query params for the courts list/search. */
export const courtsQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  surface: z.enum(COURT_SURFACES).optional(),
  environment: z.enum(COURT_ENVIRONMENTS).optional(),
  lighting: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(["distance", "rating", "name"]).default("rating"),
  limit: z.coerce.number().int().min(1).max(300).default(60),
});

export const createCourtSchema = z.object({
  name: z.string().min(2, "Enter a court name").max(120),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  surface: z.enum(COURT_SURFACES).default("ACRYLIC"),
  environment: z.enum(COURT_ENVIRONMENTS).default("OUTDOOR"),
  hasLighting: z.boolean().default(false),
  amenities: z.array(z.string().max(40)).max(20).default([]),
});

/** Admin court edit — every field optional; verify/unverify inline. */
export const adminUpdateCourtSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  address: z.string().max(200).nullable().optional(),
  city: z.string().max(80).nullable().optional(),
  country: z.string().max(80).nullable().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  surface: z.enum(COURT_SURFACES).optional(),
  environment: z.enum(COURT_ENVIRONMENTS).optional(),
  hasLighting: z.boolean().optional(),
  amenities: z.array(z.string().max(40)).max(20).optional(),
  phone: z.string().max(40).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  verified: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional(),
});

export type CourtsQuery = z.infer<typeof courtsQuerySchema>;
export type CreateCourtInput = z.infer<typeof createCourtSchema>;
