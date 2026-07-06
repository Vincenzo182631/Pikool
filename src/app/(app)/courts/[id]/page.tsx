import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Globe,
  Home,
  Lightbulb,
  MapPin,
  Phone,
  Star,
  Sun,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourtDetail } from "@/lib/services/court-detail";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RatingBadge } from "@/components/ui/rating-badge";
import { BusyMeter } from "@/components/court/busy-meter";
import { CheckInButton, SaveCourtButton, DirectionsButton } from "@/components/court/court-actions";
import { CourtReviews } from "@/components/court/court-reviews";

export const dynamic = "force-dynamic";

export default async function CourtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const court = await getCourtDetail(id, user?.id);
  if (!court) notFound();

  const surface = court.surface.charAt(0) + court.surface.slice(1).toLowerCase();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/map"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to courts
      </Link>

      {/* Photos */}
      <div className="relative mb-5 h-52 overflow-hidden rounded-2xl border border-border sm:h-64">
        {court.photos[0] ? (
          <Image src={court.photos[0]} alt="" fill className="object-cover" sizes="900px" priority />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(120deg, color-mix(in srgb, var(--brand-500) 45%, transparent), color-mix(in srgb, var(--brand-700) 60%, transparent))",
            }}
          />
        )}
      </div>

      <PageHeader
        title={court.name}
        description={[court.address, court.city, court.country].filter(Boolean).join(", ") || undefined}
        action={
          <div className="flex flex-wrap gap-2">
            {user && <CheckInButton courtId={court.id} initialCheckedIn={court.checkedInByMe} />}
            {user && <SaveCourtButton courtId={court.id} initialSaved={court.savedByMe} />}
            <DirectionsButton lat={court.lat} lng={court.lng} />
          </div>
        }
      />

      {/* Meta chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {court.verified && (
          <Badge variant="accent">
            <BadgeCheck className="size-3.5" /> Verified
          </Badge>
        )}
        <Badge variant="secondary">
          {court.environment === "INDOOR" ? <Home className="size-3.5" /> : <Sun className="size-3.5" />}
          {court.environment === "INDOOR" ? "Indoor" : "Outdoor"}
        </Badge>
        <Badge variant="secondary">{surface}</Badge>
        {court.hasLighting && (
          <Badge variant="secondary">
            <Lightbulb className="size-3.5" /> Lighting
          </Badge>
        )}
        {court.ratingCount > 0 && (
          <span className="inline-flex items-center gap-1 text-sm">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{court.ratingAvg.toFixed(1)}</span>
            <span className="text-muted-foreground">({court.ratingCount})</span>
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: live activity + amenities */}
        <div className="space-y-6 lg:col-span-2">
          {/* Live now */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Users className="size-4 text-muted-foreground" /> Playing now
              </h2>
              <BusyMeter level={court.busyLevel} count={court.occupancy} />
            </div>
            {court.players.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No one&apos;s checked in right now. {user ? "Check in to let others know you're here!" : ""}
              </p>
            ) : (
              <ul className="space-y-3">
                {court.players.map((p) => (
                  <li key={p.userId} className="flex items-center gap-3">
                    <Avatar src={p.avatarUrl} fallback={p.initials} size={36} />
                    <div className="flex-1">
                      {p.username ? (
                        <Link href={`/players/${p.username}`} className="text-sm font-medium hover:underline">
                          {p.name || `@${p.username}`}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium">{p.name || "Player"}</span>
                      )}
                    </div>
                    {p.skillLevel && <RatingBadge level={p.skillLevel} />}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Reviews */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <CourtReviews courtId={court.id} reviews={court.reviews} canReview={Boolean(user)} />
          </section>
        </div>

        {/* Right: amenities + details */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-semibold">Amenities</h2>
            {court.amenities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No amenities listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {court.amenities.map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 text-sm">
            <h2 className="mb-3 font-semibold">Details</h2>
            <dl className="space-y-2">
              <Detail label="Surface" value={surface} />
              <Detail label="Type" value={court.environment === "INDOOR" ? "Indoor" : "Outdoor"} />
              <Detail label="Lighting" value={court.hasLighting ? "Yes" : "No"} />
              {(court.city || court.country) && (
                <Detail label="Location" value={[court.city, court.country].filter(Boolean).join(", ")} />
              )}
            </dl>
          </section>

          {(court.phone || court.website) && (
            <section className="rounded-2xl border border-border bg-card p-5 text-sm">
              <h2 className="mb-3 font-semibold">Contact</h2>
              <div className="space-y-2">
                {court.phone && (
                  <a
                    href={`tel:${court.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 text-foreground hover:text-primary"
                  >
                    <Phone className="size-4 text-muted-foreground" />
                    {court.phone}
                  </a>
                )}
                {court.website && (
                  <a
                    href={court.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 break-all text-foreground hover:text-primary"
                  >
                    <Globe className="size-4 shrink-0 text-muted-foreground" />
                    {court.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
