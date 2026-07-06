import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, MapPin, Users, Sparkles, Bell, Activity, UserPen, type LucideIcon } from "lucide-react";
import { ClayIcon, type ClayTone } from "@/components/ui/clay-icon";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getFullUser, serializeMe } from "@/lib/services/user";
import { activityLabel } from "@/lib/activity";
import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  const full = await getFullUser(current.id);
  if (!full) redirect("/login");
  const me = serializeMe(full);
  const p = me.profile;

  const [activity, notifications] = await Promise.all([
    db.activityLog.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.notification.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const winPct = p && p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
  const memberSince = new Date(me.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={me.firstName ? `Welcome back, ${me.firstName}` : "Welcome to PicklePlay"}
        description="Your pickleball control center."
        action={
          <Button asChild variant="outline">
            <Link href="/profile/edit">
              <UserPen /> Edit profile
            </Link>
          </Button>
        }
      />

      {/* Profile completion */}
      {me.profileCompletion < 100 && (
        <Card className="mb-6 border-primary/30 bg-accent/40">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-primary" />
                <div>
                  <p className="font-medium">Complete your profile</p>
                  <p className="text-sm text-muted-foreground">
                    A complete profile gets you better matches.
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link href={p ? "/profile/edit" : "/onboarding"}>
                  {p ? "Finish profile" : "Start onboarding"} <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={me.profileCompletion} className="flex-1" />
              <span className="text-sm font-semibold tabular-nums">
                {me.profileCompletion}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player mini card */}
      {p && (
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <Avatar src={p.avatarUrl} fallback={initials(me.firstName, me.lastName)} size={64} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {me.firstName} {me.lastName}
                </h2>
                <RatingBadge level={p.skillLevel} />
              </div>
              <p className="text-sm text-muted-foreground">
                @{p.username}
                {p.city ? ` · ${p.city}` : ""} · Member since {memberSince}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/players/${p.username}`}>View player card</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Rating" value={p ? p.ratingValue.toFixed(1) : "—"} />
        <StatTile label="Games" value={p?.gamesPlayed ?? 0} />
        <StatTile
          label="Win %"
          value={`${winPct}%`}
          hint={p ? `${p.wins}W · ${p.losses}L` : undefined}
        />
        <StatTile label="Streak" value={p?.currentStreak ?? 0} hint="current" />
      </div>

      {/* Quick actions */}
      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Quick actions
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <QuickAction
          href="/map"
          icon={MapPin}
          tone="sky"
          title="Find a court"
          body="See courts near you with live busy levels and check-ins."
        />
        <QuickAction
          href="/matchmaking"
          icon={Users}
          tone="violet"
          title="Find players"
          body="Match with nearby players at your level and start a game."
        />
      </div>

      {/* Activity + notifications */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4 text-muted-foreground" /> Recent activity
            </h3>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                    <span>{activityLabel(a.type, a.message)}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Bell className="size-4 text-muted-foreground" /> Notifications
            </h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-muted-foreground">{n.body}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  tone,
  title,
  body,
}: {
  href: string;
  icon: LucideIcon;
  tone: ClayTone;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-3xl bg-card clay p-5 transition-transform hover:-translate-y-1"
    >
      <ClayIcon icon={icon} tone={tone} size="md" />
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
