import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow, isToday } from "date-fns";
import {
  ArrowLeft,
  Bell,
  CloudSun,
  Info,
  MapPin,
  MessageSquare,
  Swords,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { IconButton } from "@/components/ui/icon-button";
import { IconTile, type TileTone } from "@/components/ui/icon-tile";
import { Eyebrow } from "@/components/ui/editorial";
import { MarkAllRead } from "@/components/layout/mark-all-read";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

const ICONS: Record<string, LucideIcon> = {
  MESSAGE: MessageSquare,
  GAME_INVITE: Swords,
  FRIEND_REQUEST: UserPlus,
  CHECKIN: MapPin,
  TOURNAMENT: Trophy,
  WEATHER: CloudSun,
  SYSTEM: Info,
};

const TONES: Record<string, TileTone> = {
  GAME_INVITE: "accent",
  TOURNAMENT: "dark",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const today = items.filter((n) => isToday(n.createdAt));
  const earlier = items.filter((n) => !isToday(n.createdAt));
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-center gap-3">
        <IconButton asChild aria-label="Back">
          <Link href="/dashboard">
            <ArrowLeft className="size-[18px]" strokeWidth={1.8} />
          </Link>
        </IconButton>
        <h1 className="font-display flex-1 text-[26px] font-extrabold text-ink">Notifications</h1>
        {unread > 0 && <MarkAllRead />}
      </header>

      {items.length === 0 ? (
        <div className="rounded-[20px] bg-card px-5 py-14 text-center shadow-card">
          <IconTile icon={Bell} tone="gray" size="lg" className="mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink">You&apos;re all caught up</p>
          <p className="text-xs text-muted-foreground">New activity will show up here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Group title="Today" items={today} />
          <Group title="Earlier" items={earlier} />
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  items,
}: {
  title: string;
  items: { id: string; type: string; title: string; body: string | null; readAt: Date | null; createdAt: Date }[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <Eyebrow className="mb-2.5">{title}</Eyebrow>
      <div className="overflow-hidden rounded-[20px] bg-card shadow-card">
        {items.map((n, i) => {
          const Icon = ICONS[n.type] ?? Info;
          return (
            <div
              key={n.id}
              className={`flex gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""} ${
                !n.readAt ? "bg-primary/[0.06]" : ""
              }`}
            >
              <IconTile icon={Icon} tone={TONES[n.type] ?? "gray"} size="sm" className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-bold text-ink">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                  </span>
                </div>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
