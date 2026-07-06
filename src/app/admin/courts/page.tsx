import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CourtAdminActions } from "@/components/admin/court-actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PER_PAGE_OPTIONS = [10, 20, 40, 100] as const;
const DEFAULT_PER_PAGE = 20;

export default async function AdminCourtsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const sp = await searchParams;

  const perPage = PER_PAGE_OPTIONS.includes(Number(sp.perPage) as (typeof PER_PAGE_OPTIONS)[number])
    ? Number(sp.perPage)
    : DEFAULT_PER_PAGE;

  const [total, unverified] = await Promise.all([
    db.court.count(),
    db.court.count({ where: { verified: false } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), pageCount);
  const skip = (page - 1) * perPage;

  const courts = await db.court.findMany({
    orderBy: [{ verified: "asc" }, { createdAt: "desc" }],
    skip,
    take: perPage,
  });

  const from = total === 0 ? 0 : skip + 1;
  const to = skip + courts.length;
  const href = (p: number, pp: number) => `/admin/courts?page=${p}&perPage=${pp}`;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Courts</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {unverified} unverified · {total} total. Verify crowd-sourced courts, edit details, or remove bad ones.
      </p>

      {/* Page size selector */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Show</span>
        <div className="inline-flex overflow-hidden rounded-lg border border-border">
          {PER_PAGE_OPTIONS.map((n) => (
            <Link
              key={n}
              href={href(1, n)}
              scroll={false}
              aria-current={n === perPage ? "true" : undefined}
              className={cn(
                "border-l border-border px-3 py-1.5 font-medium transition-colors first:border-l-0",
                n === perPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {n}
            </Link>
          ))}
        </div>
        <span className="text-muted-foreground">per page</span>
      </div>

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
            {courts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No courts yet.
                </td>
              </tr>
            ) : (
              courts.map((c) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {from}–{to} of {total}
        </p>
        <div className="flex items-center gap-2">
          <PagerLink href={href(page - 1, perPage)} disabled={page <= 1} label="Previous">
            <ChevronLeft className="size-4" /> Prev
          </PagerLink>
          <span className="text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <PagerLink href={href(page + 1, perPage)} disabled={page >= pageCount} label="Next">
            Next <ChevronRight className="size-4" />
          </PagerLink>
        </div>
      </div>
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls =
    "inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-medium transition-colors";
  if (disabled) {
    return (
      <span className={cn(cls, "cursor-not-allowed text-muted-foreground/50")} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} aria-label={label} className={cn(cls, "bg-card hover:bg-secondary")}>
      {children}
    </Link>
  );
}
