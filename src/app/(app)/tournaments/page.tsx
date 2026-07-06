import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function TournamentsPage() {
  return (
    <FeaturePlaceholder
      title="Tournaments"
      description="The full competitive lifecycle."
      phase="Phase 2 · P1"
      points={[
        "Listings and registration windows",
        "Auto-generated brackets from the entrant list",
        "Score tracking that advances rounds",
        "Results, awards and live rankings (see docs/08)",
      ]}
    />
  );
}
