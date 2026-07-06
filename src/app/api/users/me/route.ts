import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { updateProfileSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

function serialize(user: Awaited<ReturnType<typeof requireUser>>) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    roles: user.roles.map((r) => r.role),
    profile: user.profile
      ? {
          username: user.profile.username,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatarUrl: user.profile.avatarUrl,
          skillLevel: user.profile.skillLevel,
          ratingValue: user.profile.ratingValue,
          city: user.profile.city,
          country: user.profile.country,
          gamesPlayed: user.profile.gamesPlayed,
          wins: user.profile.wins,
          losses: user.profile.losses,
          currentStreak: user.profile.currentStreak,
        }
      : null,
  };
}

export const GET = route(async () => {
  const user = await requireUser();
  return ok(serialize(user));
});

export const PATCH = route(async (req: Request) => {
  const user = await requireUser();
  const input = updateProfileSchema.parse(await req.json());

  // Username uniqueness (when provided and changed).
  if (input.username) {
    const taken = await db.profile.findFirst({
      where: { username: input.username, NOT: { userId: user.id } },
      select: { id: true },
    });
    if (taken) throw new ApiError("CONFLICT", "That username is taken.");
  }

  const existing = user.profile;
  if (!existing) {
    // Creating the profile requires the core onboarding fields.
    if (
      !input.firstName ||
      !input.lastName ||
      !input.username ||
      !input.skillLevel ||
      !input.dominantHand ||
      input.yearsPlaying === undefined ||
      !input.formats?.length
    ) {
      throw new ApiError("VALIDATION_ERROR", "Complete all onboarding fields.");
    }
    await db.profile.create({
      data: {
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        city: input.city,
        country: input.country,
        skillLevel: input.skillLevel,
        ratingValue: skillMidpoint(input.skillLevel),
        dominantHand: input.dominantHand,
        playingStyle: input.playingStyle,
        yearsPlaying: input.yearsPlaying,
        favoritePaddle: input.favoritePaddle,
        formats: input.formats,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
        coverUrl: input.coverUrl,
      },
    });
  } else {
    await db.profile.update({
      where: { userId: user.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        city: input.city,
        country: input.country,
        skillLevel: input.skillLevel,
        dominantHand: input.dominantHand,
        playingStyle: input.playingStyle,
        yearsPlaying: input.yearsPlaying,
        favoritePaddle: input.favoritePaddle,
        formats: input.formats,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
        coverUrl: input.coverUrl,
      },
    });
  }

  const fresh = await requireUser();
  return ok(serialize(fresh));
});

/** Map a skill level to the midpoint of its rating band (see docs/12). */
function skillMidpoint(level: string): number {
  const map: Record<string, number> = {
    L2_0: 2.1,
    L2_5: 2.5,
    L3_0: 3.0,
    L3_5: 3.5,
    L4_0: 4.0,
    L4_5: 4.5,
    L5_0: 5.0,
    L5_5: 5.4,
  };
  return map[level] ?? 2.5;
}
