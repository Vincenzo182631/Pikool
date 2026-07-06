import { formatDistanceToNow } from "date-fns";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "@/components/admin/report-actions";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "destructive",
  REVIEWING: "default",
  RESOLVED: "secondary",
  DISMISSED: "outline",
};

export default async function AdminReportsPage() {
  const reports = await db.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  // Load previews for POST targets.
  const postIds = reports.filter((r) => r.targetType === "POST").map((r) => r.targetId);
  const posts = postIds.length
    ? await db.post.findMany({
        where: { id: { in: postIds } },
        select: { id: true, body: true, deletedAt: true, author: { select: { email: true } } },
      })
    : [];
  const postMap = new Map(posts.map((p) => [p.id, p]));

  const open = reports.filter((r) => r.status === "OPEN" || r.status === "REVIEWING");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Reports</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {open.length} awaiting review · {reports.length} total.
      </p>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <ShieldCheck className="mx-auto mb-2 size-6 text-emerald-500" />
          <p className="font-medium">Nothing to moderate</p>
          <p className="text-sm text-muted-foreground">No reports have been filed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const post = r.targetType === "POST" ? postMap.get(r.targetId) : null;
            const isOpen = r.status === "OPEN" || r.status === "REVIEWING";
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[r.status]}>{r.status.toLowerCase()}</Badge>
                      <Badge variant="outline">{r.targetType.toLowerCase()}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(r.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Reason:</span> {r.reason}
                    </p>
                    {post && (
                      <div className="mt-2 rounded-lg border border-border bg-secondary/40 p-2 text-sm">
                        <p className="text-xs text-muted-foreground">
                          Post by {post.author.email}
                          {post.deletedAt && " · (already removed)"}
                        </p>
                        <p className="line-clamp-2">{post.body || "(no text)"}</p>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <ReportActions reportId={r.id} removable={r.targetType === "POST" || r.targetType === "COMMENT"} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
