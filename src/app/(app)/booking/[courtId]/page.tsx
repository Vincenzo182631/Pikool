import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a court" };

/** Shown when a court has no published rate. */
const DEFAULT_HOURLY_RATE = 25;

export default async function BookingPage({
  params,
}: {
  params: Promise<{ courtId: string }>;
}) {
  const { courtId } = await params;
  const court = await db.court.findUnique({
    where: { id: courtId },
    select: { id: true, name: true, pricePerHour: true },
  });
  if (!court) notFound();

  return (
    <Suspense fallback={null}>
      <BookingWizard
        courtId={court.id}
        courtName={court.name}
        price={court.pricePerHour ?? DEFAULT_HOURLY_RATE}
      />
    </Suspense>
  );
}
