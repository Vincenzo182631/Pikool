import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function MarketplacePage() {
  return (
    <FeaturePlaceholder
      title="Marketplace"
      description="Buy and sell used pickleball gear."
      phase="Phase 2 · P1"
      points={[
        "List with condition, photos and price",
        "Browse with category, condition, price and city filters",
        "Chat the seller directly",
        "Save and report listings (see docs/08)",
      ]}
    />
  );
}
