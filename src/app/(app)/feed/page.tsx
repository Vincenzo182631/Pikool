import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function FeedPage() {
  return (
    <FeaturePlaceholder
      title="Feed"
      description="A pickleball-first feed, not general social noise."
      phase="Phase 1 · P0"
      points={[
        "Game invites, match results, court & paddle reviews, tips, polls",
        "Like, comment, share, bookmark and report",
        "Personalized by who and what you follow, plus nearby activity",
        "Purpose-built cards per post type (see docs/08)",
      ]}
    />
  );
}
