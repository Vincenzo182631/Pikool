import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export default function EventsPage() {
  return (
    <FeaturePlaceholder
      title="Events"
      description="Organize structured play."
      phase="Phase 2 · P1"
      points={[
        "Clinics, lessons, open play, leagues and social games",
        "List and calendar views",
        "RSVP with capacity and waitlists",
        "Host tools to manage attendees (see docs/08)",
      ]}
    />
  );
}
