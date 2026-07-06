import { PageHeader } from "@/components/layout/page-header";
import { CourtsExplorer } from "@/components/court/courts-explorer";

export const metadata = { title: "Courts & Map" };

export default function MapPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Courts"
        description="Discover pickleball courts near you — with live busy levels and check-ins."
      />
      <CourtsExplorer />
    </div>
  );
}
