import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        This is a placeholder for PicklePlay&apos;s Privacy Policy. We minimize
        personal data, keep location sharing coarse and revocable, and never sell
        your data (see docs/16-security.md). Final policy before public launch.
      </p>
      <Button asChild variant="outline">
        <Link href="/signup">Back to sign up</Link>
      </Button>
    </div>
  );
}
