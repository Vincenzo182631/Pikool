import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

/**
 * Consistent "in progress" surface for features not yet built. Keeps the app
 * navigable and communicates the roadmap phase (see docs/14-roadmap.md).
 */
export function FeaturePlaceholder({
  title,
  description,
  phase,
  points,
}: {
  title: string;
  description: string;
  phase: string;
  points: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-2xl border border-dashed border-border bg-card p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Construction className="size-6" />
          </div>
          <Badge variant="secondary" className="mb-3">
            {phase}
          </Badge>
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This surface is scoped and ready to build. Here&apos;s what it will include:
          </p>
          <ul className="mx-auto mt-4 grid max-w-sm gap-2 text-left text-sm">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
