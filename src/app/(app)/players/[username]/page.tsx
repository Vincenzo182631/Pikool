import { notFound } from "next/navigation";
import { CalendarClock, Hand, MapPin, Star } from "lucide-react";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/avatar";
import { RatingBadge } from "@/components/ui/rating-badge";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { SKILL_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await db.profile.findUnique({ where: { username } });
  if (!profile) notFound();

  const winPct =
    profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;
  const hand = profile.dominantHand.charAt(0) + profile.dominantHand.slice(1).toLowerCase();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Cover + identity */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="h-32 w-full sm:h-40"
          style={{
            background:
              "linear-gradient(120deg, color-mix(in srgb, var(--brand-500) 55%, transparent), color-mix(in srgb, var(--brand-700) 65%, transparent))",
          }}
        />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end gap-4">
            <Avatar
              src={profile.avatarUrl}
              fallback={initials(profile.firstName, profile.lastName)}
              size={88}
              className="ring-4 ring-card"
            />
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <RatingBadge level={profile.skillLevel} />
              </div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {(profile.city || profile.country) && (
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
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Rating" value={profile.ratingValue.toFixed(1)} hint={SKILL_META[profile.skillLevel]?.label} />
        <StatTile label="Games" value={profile.gamesPlayed} />
        <StatTile label="Record" value={`${profile.wins}-${profile.losses}`} hint={`${winPct}% wins`} />
        <StatTile label="Best streak" value={profile.longestStreak} hint={`current ${profile.currentStreak}`} />
      </div>

      {profile.bio && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-semibold">About</h2>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
      )}
    </div>
  );
}
