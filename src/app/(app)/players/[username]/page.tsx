import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Hand, MapPin, Star, UserPen } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Avatar } from "@/components/ui/avatar";
import { SmartImage } from "@/components/ui/smart-image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton, ShareButton } from "@/components/profile/profile-actions";
import { initials } from "@/lib/utils";
import { SKILL_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await db.profile.findUnique({
    where: { username },
    include: {
      user: {
        include: {
          settings: true,
          badges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
        },
      },
    },
  });
  if (!profile) notFound();

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === profile.userId;
  const settings = profile.user.settings;
  const showStats = isOwner || settings?.showStats !== false;
  const showLocation = isOwner || settings?.showLocation !== false;

  const fullName = [profile.user.firstName, profile.user.lastName].filter(Boolean).join(" ");
  const winPct =
    profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;
  const hand = profile.dominantHand.charAt(0) + profile.dominantHand.slice(1).toLowerCase();
  const memberSince = profile.user.createdAt.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-3xl bg-card shadow-card">
        {/* Cover */}
        <div className="relative h-32 w-full sm:h-44">
          {profile.coverUrl ? (
            <SmartImage src={profile.coverUrl} alt="" fill className="object-cover" sizes="768px" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(120deg, #1E5F5B 0%, #2A2F31 100%)",
              }}
            />
          )}
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar
                src={profile.avatarUrl}
                fallback={initials(profile.user.firstName, profile.user.lastName)}
                size={88}
                className="ring-4 ring-card"
              />
            </div>
            <div className="flex gap-2 pb-1">
              {isOwner ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/edit">
                    <UserPen /> Edit profile
                  </Link>
                </Button>
              ) : (
                <FollowButton username={profile.username} />
              )}
              <ShareButton username={profile.username} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[22px] font-extrabold text-ink">
                {profile.displayName || fullName || `@${profile.username}`}
              </h1>
              <RatingBadge level={profile.skillLevel} />
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {showLocation && (profile.city || profile.country) && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {[profile.city, profile.country].filter(Boolean).join(", ")}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Hand className="size-4" />
              {hand}-handed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              {profile.yearsPlaying} yr{profile.yearsPlaying === 1 ? "" : "s"} playing
            </span>
            {profile.favoritePaddle && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4" />
                {profile.favoritePaddle}
              </span>
            )}
            <span>Member since {memberSince}</span>
          </div>

          {profile.formats.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.formats.map((f) => (
                <Badge key={f} variant="secondary">
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Rating" value={profile.ratingValue.toFixed(1)} hint={SKILL_META[profile.skillLevel]?.label} />
          <StatTile label="Games" value={profile.gamesPlayed} />
          <StatTile label="Record" value={`${profile.wins}-${profile.losses}`} hint={`${winPct}% wins`} />
          <StatTile label="Best streak" value={profile.longestStreak} hint={`current ${profile.currentStreak}`} />
        </div>
      )}

      {/* Badges */}
      <div className="mt-4 rounded-3xl bg-card shadow-card p-5">
        <h2 className="font-display mb-3 text-lg font-bold text-ink">Achievements</h2>
        {profile.user.badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No badges yet — play matches and check in to courts to earn them.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {profile.user.badges.map((ub) => (
              <div
                key={ub.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2"
                title={ub.badge.description}
              >
                <span className="text-lg">{tierEmoji(ub.badge.tier)}</span>
                <span className="text-sm font-medium">{ub.badge.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {profile.bio && (
        <div className="mt-4 rounded-3xl bg-card shadow-card p-5">
          <h2 className="font-display mb-1 text-lg font-bold text-ink">About</h2>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
      )}
    </div>
  );
}

function tierEmoji(tier: string) {
  return { BRONZE: "🥉", SILVER: "🥈", GOLD: "🥇", PLATINUM: "💎" }[tier] ?? "🏅";
}
