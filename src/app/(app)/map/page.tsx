import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function MapPage() {
  return (
    <FeaturePlaceholder
      title="Map"
      description="The definitive map of the pickleball world."
      phase="Phase 1 · P0"
      points={[
        "Interactive Google Map with layered markers and filters",
        "Courts, stores, coaches, clubs, tournaments and amenities",
        "Live busy levels and current check-ins per court",
        "Viewport-driven loading with clustering (see docs/10)",
      ]}
    />
  );
}
