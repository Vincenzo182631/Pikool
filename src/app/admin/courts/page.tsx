import { BadgeCheck } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CourtAdminActions } from "@/components/admin/court-actions";

export const dynamic = "force-dynamic";

export default async function AdminCourtsPage() {
  const [courts, unverified] = await Promise.all([
    db.court.findMany({ orderBy: [{ verified: "asc" }, { createdAt: "desc" }], take: 100 }),
    db.court.count({ where: { verified: false } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Courts</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {unverified} unverified · {courts.length} shown. Verify crowd-sourced courts or remove bad ones.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Court</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courts.map((c) => (
              <tr key={c.id} className="bg-card">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  {c.verified ? (
                    <Badge variant="accent">
                      <BadgeCheck className="size-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <CourtAdminActions courtId={c.id} verified={c.verified} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
