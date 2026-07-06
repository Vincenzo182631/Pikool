import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="prose-sm mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">
        This is a placeholder for PicklePlay&apos;s Terms of Service. Final legal
        copy will be provided before public launch (see docs/16-security.md and
        docs/00-project-overview.md for scope).
      </p>
      <Button asChild variant="outline">
        <Link href="/signup">Back to sign up</Link>
      </Button>
    </div>
  );
}
