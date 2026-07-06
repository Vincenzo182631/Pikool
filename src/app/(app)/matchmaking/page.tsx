import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function MatchmakingPage() {
  return (
    <FeaturePlaceholder
      title="Matchmaking"
      description="Connect with nearby, compatible players — fast."
      phase="Phase 1 · P0"
      points={[
        "Filter by distance, skill, age, availability and format",
        'One-tap "I\'m Available" broadcast with a time window',
        "Nearby players get notified in realtime",
        "Invite, accept, and turn intent into a game (see docs/08)",
      ]}
    />
  );
}
