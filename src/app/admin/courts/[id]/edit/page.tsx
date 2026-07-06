import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CourtEditForm } from "@/components/admin/court-edit-form";

export const dynamic = "force-dynamic";

export default async function AdminCourtEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const court = await db.court.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      country: true,
      lat: true,
      lng: true,
      phone: true,
      website: true,
      surface: true,
      environment: true,
      hasLighting: true,
      amenities: true,
      verified: true,
    },
  });
  if (!court) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/courts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to courts
      </Link>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Edit court</h1>
      <p className="mb-6 text-sm text-muted-foreground">{court.name}</p>
      <div className="rounded-2xl border border-border bg-card p-5">
        <CourtEditForm court={court} />
      </div>
    </div>
  );
}
