import { db } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { logActivity } from "@/lib/activity";
import { updateProfileSchema } from "@/lib/validation/user";
import { getFullUser, serializeMe, skillMidpoint } from "@/lib/services/user";
import { createWelcomePost } from "@/lib/services/post";

export const runtime = "nodejs";

export const GET = route(async () => {
  const user = await requireUser();
  const full = await getFullUser(user.id);
  if (!full) throw new ApiError("NOT_FOUND", "User not found.");
  return ok(serializeMe(full));
});

export const PATCH = route(async (req: Request) => {
  const user = await requireUser();
  const input = updateProfileSchema.parse(await req.json());

  // Username uniqueness (when provided).
  if (input.username) {
    const taken = await db.profile.findFirst({
      where: { username: input.username, NOT: { userId: user.id } },
      select: { id: true },
    });
    if (taken) throw new ApiError("CONFLICT", "That username is taken.");
  }

  // Optionally update the account's real name (edit profile).
  if (input.firstName || input.lastName) {
    await db.user.update({
      where: { id: user.id },
      data: {
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
      },
    });
  }

  const profileData = {
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
    coverUrl: input.coverUrl,
    bio: input.bio,
    city: input.city,
    country: input.country,
    skillLevel: input.skillLevel,
    dominantHand: input.dominantHand,
    playingStyle: input.playingStyle,
    yearsPlaying: input.yearsPlaying,
    favoritePaddle: input.favoritePaddle,
    formats: input.formats,
    availability: input.availability,
  };

  if (!user.profile) {
    // Creating the profile requires the core onboarding fields.
    if (
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
        username: input.username,
        ratingValue: skillMidpoint(input.skillLevel),
        ...profileData,
        formats: input.formats,
      },
    });
    // Announce the new member in the feed so the community can welcome them.
    await createWelcomePost({
      userId: user.id,
      displayName: input.displayName ?? input.username,
      city: input.city,
    });
  } else {
    await db.profile.update({
      where: { userId: user.id },
      data: { ...profileData, username: input.username },
    });
  }

  await logActivity({ userId: user.id, type: "PROFILE_UPDATED" });

  const fresh = await getFullUser(user.id);
  return ok(serializeMe(fresh!));
});
