import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function ClubsPage() {
  return (
    <FeaturePlaceholder
      title="Clubs"
      description="Communities with a home of their own."
      phase="Phase 2 · P1"
      points={[
        "Create and manage clubs with member roles",
        "Members, events, posts and a gallery",
        "Realtime club chat",
        "Join requests and approvals (see docs/08)",
      ]}
    />
  );
}
