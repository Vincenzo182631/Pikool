"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  MessageSquare,
  Swords,
  UserPlus,
  MapPin,
  Trophy,
  CloudSun,
  Info,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/use-notifications";
import type { NotificationItem } from "@/types/notification";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MESSAGE: MessageSquare,
  GAME_INVITE: Swords,
  FRIEND_REQUEST: UserPlus,
  CHECKIN: MapPin,
  TOURNAMENT: Trophy,
  WEATHER: CloudSun,
  SYSTEM: Info,
};

/** Resolve where a notification should take the user when clicked. */
function hrefFor(n: NotificationItem): string {
  const d = n.data ?? {};
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : undefined);
  switch (n.type) {
    case "GAME_INVITE":
      return "/matchmaking";
    case "MESSAGE":
      return str("conversationId") ? `/messages/${str("conversationId")}` : "/messages";
    case "FRIEND_REQUEST":
      return str("username") ? `/players/${str("username")}` : "/dashboard";
    case "CHECKIN":
      return str("courtId") ? `/courts/${str("courtId")}` : "/map";
    case "TOURNAMENT":
      return str("tournamentId") ? `/tournaments/${str("tournamentId")}` : "/tournaments";
    default:
      return "/dashboard";
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const { data } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;

  // Close on outside click / Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openItem(n: NotificationItem) {
    if (!n.readAt) markRead.mutate({ ids: [n.id] });
    setOpen(false);
    router.push(hrefFor(n));
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="relative">
          <Bell />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-3xl bg-card clay shadow-lg animate-in fade-in-0 zoom-in-95 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead.mutate({ all: true })}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[22rem] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 size-5 text-muted-foreground" />
                <p className="text-sm font-medium">You&apos;re all caught up</p>
                <p className="text-xs text-muted-foreground">New activity will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((n) => {
                  const Icon = ICONS[n.type] ?? Info;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                          !n.readAt && "bg-primary/5",
                        )}
                      >
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium leading-snug">{n.title}</span>
                          {n.body && (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{n.body}</span>
                          )}
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </span>
                        {!n.readAt && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
