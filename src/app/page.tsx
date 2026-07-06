import Link from "next/link";
import {
  MapPin,
  Users,
  CalendarDays,
  Trophy,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const FEATURES = [
  { icon: MapPin, title: "Discover courts", body: "The definitive map of courts, stores, coaches, and clubs near you — with live busy levels." },
  { icon: Users, title: "Find players", body: "Match with nearby players at your level. Tap “I'm Available” and get playing today." },
  { icon: CalendarDays, title: "Organize games", body: "Open play, clinics, leagues and social games — RSVP, waitlists, and calendars." },
  { icon: TrendingUp, title: "Track progress", body: "A pro-style player card: skill rating, record, streaks, achievements and badges." },
  { icon: Trophy, title: "Compete", body: "Full tournaments: registration, brackets, live scores, results and rankings." },
  { icon: MessageSquare, title: "Stay connected", body: "Realtime chat, clubs, and a pickleball-first feed built for the community." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(60rem 30rem at 50% -10%, color-mix(in srgb, var(--brand-500) 22%, transparent), transparent)",
            }}
          />
          <div className="mx-auto max-w-4xl px-5 pb-16 pt-14 text-center sm:pt-20">
            <Badge variant="accent" className="mb-5">
              🎾 Now in early access
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
              {APP_TAGLINE}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
              {APP_NAME} is the all-in-one home for pickleball — discover courts,
              find players, organize games, track your progress, and join the
              community. Fast, premium, and built for how you actually play.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Create your free account <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-3xl bg-card clay p-6 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="glass overflow-hidden rounded-3xl border border-border p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to play?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join players building the world's best pickleball community.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/signup">
                Get started — it's free <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </span>
          <span>{APP_TAGLINE}</span>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <span className="text-sm font-black">P</span>
    </span>
  );
}
