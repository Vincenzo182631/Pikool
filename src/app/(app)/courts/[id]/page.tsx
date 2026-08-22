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
  ShowerHead,
  Sun,
  Users,
  Wifi,
  CircleParking,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourtDetail } from "@/lib/services/court-detail";
import { CHECKIN_TTL_HOURS } from "@/lib/constants";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Rating } from "@/components/ui/editorial";
import { RatingBadge } from "@/components/ui/rating-badge";
import { BusyMeter } from "@/components/court/busy-meter";
import { CourtArt } from "@/components/court/court-art";
import { CheckInButton, SaveCourtButton, DirectionsButton } from "@/components/court/court-actions";
import { CourtReviews } from "@/components/court/court-reviews";
import { SlotPicker } from "@/components/court/slot-picker";

export const dynamic = "force-dynamic";

/** Amenity label → icon, so the grid reads like the handoff's 4-up tiles. */
const AMENITY_ICONS: { match: RegExp; icon: LucideIcon }[] = [
  { match: /wi-?fi/i, icon: Wifi },
  { match: /park/i, icon: CircleParking },
  { match: /shower/i, icon: ShowerHead },
  { match: /light|night/i, icon: Lightbulb },
  { match: /water|coffee|seat|shop|net/i, icon: MapPin },
];

function amenityIcon(label: string): LucideIcon {
  return AMENITY_ICONS.find((a) => a.match.test(label))?.icon ?? MapPin;
}

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
  const locationLine = [court.city, court.country].filter(Boolean).join(", ");

  // Derive taken slots from live check-ins so availability reflects reality.
  const since = new Date(Date.now() - CHECKIN_TTL_HOURS * 3600_000);
  const liveCheckIns = await db.checkIn.findMany({
    where: { courtId: court.id, createdAt: { gt: since } },
    select: { createdAt: true },
  });
  const takenSlots = [
    ...new Set(
      liveCheckIns.map((c) => `${String(Math.floor(c.createdAt.getHours() / 2) * 2).padStart(2, "0")}:00`),
    ),
  ];

  const amenities = court.amenities.length
    ? court.amenities
    : [court.hasLighting ? "Night Lights" : "Day Play", surface, court.environment === "INDOOR" ? "Indoor" : "Outdoor"];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero */}
      <div className="relative -mx-5 h-[300px] overflow-hidden sm:mx-0 sm:h-[380px] sm:rounded-[24px]">
        {court.photos[0] ? (
          <Image src={court.photos[0]} alt="" fill priority sizes="(max-width:768px) 100vw, 672px" className="object-cover" />
        ) : (
          <CourtArt seed={court.id} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/25" />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between">
          <IconButton asChild aria-label="Back to courts">
            <Link href="/courts">
              <ArrowLeft className="size-[18px]" strokeWidth={1.8} />
            </Link>
          </IconButton>
          <div className="flex items-center gap-2">
            {user && <SaveCourtButton courtId={court.id} initialSaved={court.savedByMe} />}
            <DirectionsButton lat={court.lat} lng={court.lng} />
          </div>
        </div>
      </div>

      {/* Info card — overlaps the hero */}
      <div className="relative z-10 -mt-10 rounded-[24px] bg-card p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display flex items-center gap-1.5 text-2xl font-extrabold text-ink">
              <span className="truncate">{court.name}</span>
              {court.verified && <BadgeCheck className="size-5 shrink-0 text-ink" />}
            </h1>
            {locationLine && (
              <p className="mt-1 inline-flex items-center gap-1 whitespace-nowrap text-[11.5px] text-muted-foreground">
                <MapPin className="size-3" strokeWidth={2} /> {locationLine}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {court.pricePerHour !== null && (
              <p className="font-display text-[26px] font-extrabold leading-none text-ink">
                ${court.pricePerHour}
                <span className="text-sm font-bold opacity-50"> /hr</span>
              </p>
            )}
            {court.ratingCount > 0 && (
              <Rating value={court.ratingAvg} className="mt-1.5 justify-end" />
            )}
          </div>
        </div>

        <hr className="my-4 border-border" />

        {/* Amenities */}
        <div className="grid grid-cols-4 gap-2">
          {amenities.slice(0, 4).map((a) => {
            const Icon = amenityIcon(a);
            return (
              <div key={a} className="rounded-xl bg-ink/[0.03] p-2.5 text-center">
                <Icon className="mx-auto mb-1 size-4 text-ink" strokeWidth={1.8} />
                <p className="truncate text-[10px] font-medium text-ink">{a}</p>
              </div>
            );
          })}
        </div>

        {/* About */}
        <div className="mt-5">
          <h3 className="font-display mb-1.5 text-base font-bold text-ink">About</h3>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            {court.environment === "INDOOR" ? "An indoor" : "An outdoor"} {surface.toLowerCase()}-surface
            venue{court.hasLighting ? " with lighting for night play" : ""}
            {locationLine ? ` in ${locationLine}` : ""}. Open for casual play, clinics and ladder nights.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {court.environment === "INDOOR" ? <Home className="size-3" /> : <Sun className="size-3" />}
              {court.environment === "INDOOR" ? "Indoor" : "Outdoor"}
            </Badge>
            <Badge variant="secondary">{surface}</Badge>
            {court.hasLighting && (
              <Badge variant="secondary">
                <Lightbulb className="size-3" /> Lit
              </Badge>
            )}
          </div>
        </div>

        {/* Availability + sticky book bar */}
        <div className="mt-5">
          <SlotPicker courtId={court.id} price={court.pricePerHour} takenSlots={takenSlots} />
        </div>
      </div>

      {/* Playing now */}
      <section className="mt-5 rounded-[20px] bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display flex items-center gap-2 text-lg font-bold text-ink">
            <Users className="size-4" strokeWidth={1.8} /> Playing now
          </h2>
          <BusyMeter level={court.busyLevel} count={court.occupancy} />
        </div>
        {court.players.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No one&apos;s checked in right now.{" "}
            {user ? "Check in to let others know you're here." : ""}
          </p>
        ) : (
          <ul className="space-y-3">
            {court.players.map((p) => (
              <li key={p.userId} className="flex items-center gap-3">
                <Avatar src={p.avatarUrl} fallback={p.initials} size={36} />
                <div className="flex-1 min-w-0">
                  {p.username ? (
                    <Link href={`/players/${p.username}`} className="truncate text-sm font-semibold hover:underline">
                      {p.name || `@${p.username}`}
                    </Link>
                  ) : (
                    <span className="truncate text-sm font-semibold">{p.name || "Player"}</span>
                  )}
                </div>
                {p.skillLevel && <RatingBadge level={p.skillLevel} />}
              </li>
            ))}
          </ul>
        )}
        {user && (
          <div className="mt-4">
            <CheckInButton courtId={court.id} initialCheckedIn={court.checkedInByMe} />
          </div>
        )}
      </section>

      {/* Contact */}
      {(court.phone || court.website) && (
        <section className="mt-4 rounded-[20px] bg-card p-5 text-sm shadow-card">
          <h2 className="font-display mb-3 text-lg font-bold text-ink">Contact</h2>
          <div className="space-y-2">
            {court.phone && (
              <a
                href={`tel:${court.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 text-ink hover:underline"
              >
                <Phone className="size-4 text-muted-foreground" strokeWidth={1.8} />
                {court.phone}
              </a>
            )}
            {court.website && (
              <a
                href={court.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 break-all text-ink hover:underline"
              >
                <Globe className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                {court.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-4 rounded-[20px] bg-card p-5 shadow-card">
        <CourtReviews courtId={court.id} reviews={court.reviews} canReview={Boolean(user)} />
      </section>
    </div>
  );
}
