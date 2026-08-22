import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Bell, Sparkles, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getFullUser, serializeMe } from "@/lib/services/user";
import { CHECKIN_TTL_HOURS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SectionTitle } from "@/components/ui/editorial";
import { Progress } from "@/components/ui/progress";
import { HomeHero } from "@/components/home/home-hero";
import { StatusCard } from "@/components/home/status-card";

export const dynamic = "force-dynamic";

/** Editorial imagery for the featured-events rail. */
const EVENT_RAIL = [
  { name: "Summer Slam", date: "Jun 22", img: "/editorial/event_camp.jpg" },
  { name: "City Open", date: "Jul 08", img: "/editorial/event_tournament.jpg" },
  { name: "Doubles Cup", date: "Aug 14", img: "/editorial/event_doubles.jpg" },
];

export default async function HomePage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  const full = await getFullUser(current.id);
  if (!full) redirect("/login");
  const me = serializeMe(full);
  const p = me.profile;

  const busyCutoff = new Date(Date.now() - CHECKIN_TTL_HOURS * 3600_000);

  const [featured, totalCourts, busyCourts, nextMatch] = await Promise.all([
    db.court.findFirst({
      where: { verified: true },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      select: { id: true, name: true, city: true, country: true, ratingAvg: true, ratingCount: true },
    }),
    db.court.count({ where: { verified: true } }),
    db.checkIn.findMany({
      where: { createdAt: { gt: busyCutoff } },
      select: { courtId: true },
      distinct: ["courtId"],
    }),
    db.matchRequest.findFirst({
      where: { status: "ACCEPTED", OR: [{ fromUserId: me.id }, { toUserId: me.id }] },
      orderBy: { proposedAt: "asc" },
      select: { proposedAt: true },
    }),
  ]);

  // "Courts available" = verified courts with no live check-in right now.
  const courtsAvailable = Math.max(0, totalCourts - busyCourts.length);

  const nextMatchLabel = nextMatch?.proposedAt
    ? nextMatch.proposedAt
        .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
        .toUpperCase()
    : "—";

  const firstName = me.firstName?.trim() || p?.username || "player";
  const location = [featured?.city, featured?.country].filter(Boolean).join(", ") || "New York, US";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Greeting */}
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1.5 text-sm text-muted-foreground">Hi, {firstName} 👋</p>
          <h1 className="text-[26px] font-medium leading-none tracking-[-0.02em] text-ink">
            Explore the
          </h1>
          <p className="font-display mt-0.5 text-[42px] font-extrabold leading-none tracking-[-0.03em] text-ink">
            Pickleball
          </p>
        </div>
        <IconButton asChild aria-label="Notifications">
          <Link href="/notifications">
            <Bell className="size-5" strokeWidth={1.8} />
          </Link>
        </IconButton>
      </header>

      <HomeHero
        featuredCourtId={featured?.id ?? null}
        featuredName={featured?.name ?? "Popular Courts"}
        location={location}
        rating={featured && featured.ratingCount > 0 ? Number(featured.ratingAvg.toFixed(1)) : null}
      />

      {/* Finish your profile */}
      {me.profileCompletion < 100 && (
        <div className="mt-5 rounded-[20px] bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-ink" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-semibold text-ink">Complete your profile</p>
                <p className="text-xs text-muted-foreground">
                  A complete profile gets you better matches.
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href={p ? "/profile/edit" : "/onboarding"}>
                {p ? "Finish" : "Start"} <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={me.profileCompletion} className="flex-1" />
            <span className="text-xs font-bold tabular-nums text-ink">{me.profileCompletion}%</span>
          </div>
        </div>
      )}

      <div className="mt-5">
        <StatusCard courtsAvailable={courtsAvailable} nextMatchLabel={nextMatchLabel} />
      </div>

      {/* Featured events rail */}
      <section className="mt-7">
        <SectionTitle
          action={
            <Link
              href="/events"
              className="text-[13px] font-semibold text-muted-foreground hover:text-ink"
            >
              See all
            </Link>
          }
        >
          Featured Events
        </SectionTitle>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {EVENT_RAIL.map((e) => (
            <Link
              key={e.name}
              href="/events"
              className="press relative h-[190px] w-40 shrink-0 overflow-hidden rounded-[18px] shadow-soft"
            >
              <Image src={e.img} alt="" fill sizes="160px" className="object-cover" />
              <div className="scrim-b absolute inset-0" />
              <div className="absolute inset-x-3 bottom-3 text-white">
                <p className="text-[11px] opacity-85">{e.date}</p>
                <p className="font-display text-xl font-bold leading-tight">{e.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
