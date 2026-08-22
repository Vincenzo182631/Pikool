import { PageHeader } from "@/components/layout/page-header";
import { EventsClient, type CampItem, type EventItem } from "@/components/events/events-client";

export const metadata = { title: "Camps & Events" };

/**
 * Seeded programming from the design handoff. These become database-backed
 * once the Event/Camp models are wired — the component contract won't change.
 */
const CAMPS: CampItem[] = [
  {
    id: "summer-intensive",
    name: "Summer Intensive",
    dates: "Jun 8–14",
    location: "Brooklyn",
    price: "$480",
    level: "All levels",
    img: "/editorial/event_camp.jpg",
  },
  {
    id: "pro-doubles",
    name: "Pro Doubles Camp",
    dates: "Jul 12–14",
    location: "Queens",
    price: "$320",
    level: "Advanced",
    img: "/editorial/event_tournament.jpg",
  },
  {
    id: "youth-academy",
    name: "Youth Academy",
    dates: "Aug 3–9",
    location: "Manhattan",
    price: "$260",
    level: "Junior",
    img: "/editorial/event_doubles.jpg",
  },
];

const EVENTS: EventItem[] = [
  { id: "city-open", name: "City Open 2026", month: "Jul", day: "08", time: "9:00 AM", spots: "24 spots left" },
  { id: "ladder-night", name: "Ladder Night", month: "Jun", day: "12", time: "6:30 PM", spots: "Waitlist" },
  { id: "family-cup", name: "Family Doubles Cup", month: "Aug", day: "14", time: "10:00 AM", spots: "8 spots left" },
  { id: "charity", name: "Charity Tournament", month: "Sep", day: "05", time: "8:00 AM", spots: "32 spots left" },
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="What's happening" title="Camps & Events" />
      <EventsClient
        camps={CAMPS}
        events={EVENTS}
        initialTab={tab === "Events" ? "Events" : "Camps"}
      />
    </div>
  );
}
