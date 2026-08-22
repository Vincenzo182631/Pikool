import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, Flag, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "@/components/admin/report-actions";

export const dynamic = "force-dynamic";

interface Group {
  targetType: string;
  targetId: string;
  count: number;
  reasons: string[];
  lastReportedAt: Date;
}

export default async function AdminReportsPage() {
  const openReports = await db.report.findMany({
    where: { status: { in: ["OPEN", "REVIEWING"] } },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
  const totalResolved = await db.report.count({ where: { status: { in: ["RESOLVED", "DISMISSED"] } } });

  // Group by target so an admin can triage by how many reports each item has.
  const groups = new Map<string, Group>();
  for (const r of openReports) {
    const key = `${r.targetType}:${r.targetId}`;
    const g = groups.get(key);
    if (g) {
      g.count += 1;
      if (!g.reasons.includes(r.reason)) g.reasons.push(r.reason);
      if (r.createdAt > g.lastReportedAt) g.lastReportedAt = r.createdAt;
    } else {
      groups.set(key, { targetType: r.targetType, targetId: r.targetId, count: 1, reasons: [r.reason], lastReportedAt: r.createdAt });
    }
  }
  const list = [...groups.values()].sort((a, b) => b.count - a.count || (a.lastReportedAt < b.lastReportedAt ? 1 : -1));

  // Load previews for POST and USER targets.
  const postIds = list.filter((g) => g.targetType === "POST").map((g) => g.targetId);
  const userIds = list.filter((g) => g.targetType === "USER").map((g) => g.targetId);
  const [posts, users] = await Promise.all([
    postIds.length
      ? db.post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, body: true, type: true, deletedAt: true, author: { select: { email: true, profile: { select: { username: true } } } } },
        })
      : [],
    userIds.length
      ? db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, deletedAt: true, profile: { select: { username: true } } } })
      : [],
  ]);
  const postMap = new Map(posts.map((p) => [p.id, p]));
  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Reports</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {list.length} item{list.length === 1 ? "" : "s"} awaiting review · {openReports.length} open report
        {openReports.length === 1 ? "" : "s"} · {totalResolved} resolved.
      </p>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <ShieldCheck className="mx-auto mb-2 size-6 text-emerald-500" />
          <p className="font-medium">Nothing to moderate</p>
          <p className="text-sm text-muted-foreground">All caught up — no open reports.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((g) => {
            const post = g.targetType === "POST" ? postMap.get(g.targetId) : null;
            const usr = g.targetType === "USER" ? userMap.get(g.targetId) : null;
            const authorUsername = post?.author.profile?.username ?? null;
            return (
              <div key={`${g.targetType}:${g.targetId}`} className="rounded-3xl bg-card shadow-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {/* report count = urgency */}
                      <Badge variant={g.count >= 3 ? "destructive" : "secondary"}>
                        <Flag className="size-3" /> {g.count} report{g.count === 1 ? "" : "s"}
                      </Badge>
                      <Badge variant="outline">{g.targetType.toLowerCase()}</Badge>
                      <span className="text-xs text-muted-foreground">
                        latest {formatDistanceToNow(g.lastReportedAt, { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm">
                      <span className="text-muted-foreground">Reason{g.reasons.length > 1 ? "s" : ""}:</span>{" "}
                      {g.reasons.join(" · ")}
                    </p>

                    {/* POST preview + verify link */}
                    {g.targetType === "POST" && (
                      <div className="mt-2 rounded-lg border border-border bg-secondary/40 p-2.5 text-sm">
                        {post ? (
                          <>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {post.type.toLowerCase().replace("_", " ")} by{" "}
                                {authorUsername ? (
                                  <Link href={`/players/${authorUsername}`} className="font-medium text-foreground hover:underline">
                                    @{authorUsername}
                                  </Link>
                                ) : (
                                  post.author.email
                                )}
                                {post.deletedAt && " · (already removed)"}
                              </p>
                              <Link
                                href={`/posts/${g.targetId}`}
                                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                              >
                                View post <ExternalLink className="size-3" />
                              </Link>
                            </div>
                            <p className="line-clamp-3 whitespace-pre-wrap">{post.body || "(no text)"}</p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Post not found (deleted).</p>
                        )}
                      </div>
                    )}

                    {/* USER preview + link */}
                    {g.targetType === "USER" && usr && (
                      <div className="mt-2 rounded-lg border border-border bg-secondary/40 p-2.5 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            {usr.email}
                            {usr.deletedAt && " · (suspended)"}
                          </p>
                          {usr.profile?.username && (
                            <Link href={`/players/${usr.profile.username}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                              View profile <ExternalLink className="size-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <ReportActions
                    targetType={g.targetType}
                    targetId={g.targetId}
                    removable={["POST", "COMMENT", "USER"].includes(g.targetType)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
