import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MapPin, Users, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const p = user.profile;
  const winPct = p && p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={p ? `Welcome back, ${p.firstName}` : "Welcome to PicklePlay"}
        description="Your pickleball control center."
      />

      {!p && (
        <Card className="mb-6 border-primary/30 bg-accent/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary" />
              <div>
                <p className="font-medium">Finish setting up your profile</p>
                <p className="text-sm text-muted-foreground">
                  Complete onboarding to unlock matchmaking and your player card.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/onboarding">
                Complete profile <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {p && (
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <Avatar
              src={p.avatarUrl}
              fallback={initials(p.firstName, p.lastName)}
              size={64}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {p.firstName} {p.lastName}
                </h2>
                <RatingBadge level={p.skillLevel} />
              </div>
              <p className="text-sm text-muted-foreground">
                @{p.username}
                {p.city ? ` · ${p.city}` : ""}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/players/${p.username}`}>View player card</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Rating" value={p ? p.ratingValue.toFixed(1) : "—"} />
        <StatTile label="Games" value={p?.gamesPlayed ?? 0} />
        <StatTile label="Win %" value={`${winPct}%`} hint={p ? `${p.wins}W · ${p.losses}L` : undefined} />
        <StatTile label="Streak" value={p?.currentStreak ?? 0} hint="current" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <QuickAction
          href="/map"
          icon={<MapPin className="size-5" />}
          title="Find a court"
          body="See courts near you with live busy levels and check-ins."
        />
        <QuickAction
          href="/matchmaking"
          icon={<Users className="size-5" />}
          title="Find players"
          body="Match with nearby players at your level and start a game."
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        {icon}
      </span>
      <div className="flex-1">
        <p className="flex items-center gap-1 font-semibold">
          {title}
          <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
      </div>
    </Link>
  );
}
