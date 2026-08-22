import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Users, MapPin, Newspaper, Flag } from "lucide-react";
import { db } from "@/lib/db";
import { StatTile } from "@/components/ui/stat-tile";
import { activityLabel } from "@/lib/activity";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const [
    users,
    newUsers,
    courts,
    verifiedCourts,
    posts,
    openReports,
    activeCheckIns,
    recentActivity,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.court.count(),
    db.court.count({ where: { verified: true } }),
    db.post.count({ where: { deletedAt: null } }),
    db.report.count({ where: { status: "OPEN" } }),
    db.checkIn.count({ where: { expiresAt: { gt: now } } }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 12, include: { user: { select: { email: true } } } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Overview</h1>
      <p className="mb-6 text-sm text-muted-foreground">Platform health at a glance.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Users" value={users} hint={`+${newUsers} this week`} />
        <StatTile label="Courts" value={courts} hint={`${verifiedCourts} verified`} />
        <StatTile label="Posts" value={posts} />
        <StatTile label="Open reports" value={openReports} />
        <StatTile label="Playing now" value={activeCheckIns} hint="active check-ins" />
        <StatTile label="New signups" value={newUsers} hint="last 7 days" />
      </div>

      {openReports > 0 && (
        <Link
          href="/admin/reports"
          className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-600 hover:bg-amber-500/15 dark:text-amber-400"
        >
          <Flag className="size-4" /> {openReports} report{openReports === 1 ? "" : "s"} awaiting review →
        </Link>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-card shadow-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Quick links</h2>
          <div className="grid gap-2">
            <QuickLink href="/admin/users" icon={<Users className="size-4" />} label="Manage users & roles" />
            <QuickLink href="/admin/reports" icon={<Flag className="size-4" />} label="Moderation queue" />
            <QuickLink href="/admin/courts" icon={<MapPin className="size-4" />} label="Verify courts" />
            <QuickLink href="/admin/posts" icon={<Newspaper className="size-4" />} label="Review posts" />
          </div>
        </div>

        <div className="rounded-3xl bg-card shadow-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="text-muted-foreground">{a.user.email.split("@")[0]}</span>{" "}
                    {activityLabel(a.type, a.message).toLowerCase()}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
      {icon}
      {label}
    </Link>
  );
}
