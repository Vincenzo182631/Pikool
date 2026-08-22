import {
  LayoutDashboard,
  Map,
  Newspaper,
  Users,
  MessageSquare,
  CalendarDays,
  Trophy,
  Store,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";

export const APP_NAME = "PicklePlay";
export const APP_TAGLINE = "The Ultimate Pickleball Community";

/** How long a court check-in stays active before auto-expiring (docs/10). */
export const CHECKIN_TTL_HOURS = 3;

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courts", href: "/courts", icon: Map },
  { label: "Matches", href: "/matchmaking", icon: Trophy },
  { label: "Feed", href: "/feed", icon: Newspaper },
  { label: "Players", href: "/players", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Clubs", href: "/clubs", icon: Store },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
];

/**
 * The four tabs of the floating mobile nav (design handoff §BottomNav).
 * Other routes map onto one of these for active state — see `tabForPath`.
 */
export const PRIMARY_TABS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courts", href: "/courts", icon: CalendarDays },
  { label: "Matches", href: "/matchmaking", icon: Trophy },
  { label: "Profile", href: "/profile", icon: User },
];

/** Which bottom-nav tab owns a given pathname. */
export function tabForPath(pathname: string): string {
  if (pathname.startsWith("/courts") || pathname.startsWith("/map") || pathname.startsWith("/booking") || pathname.startsWith("/search") || pathname.startsWith("/events")) {
    return "/courts";
  }
  if (pathname.startsWith("/matchmaking") || pathname.startsWith("/matches")) return "/matchmaking";
  if (pathname.startsWith("/profile") || pathname.startsWith("/players") || pathname.startsWith("/settings")) return "/profile";
  return "/dashboard";
}

/** Skill level → display metadata (see docs/12-player-rating.md). */
export const SKILL_META: Record<
  string,
  { label: string; value: string; blurb: string }
> = {
  L2_0: { label: "Beginner", value: "2.0", blurb: "Just starting out" },
  L2_5: { label: "Novice", value: "2.5", blurb: "Learning the basics" },
  L3_0: { label: "Developing", value: "3.0", blurb: "Building consistency" },
  L3_5: { label: "Intermediate", value: "3.5", blurb: "Reliable rallies" },
  L4_0: { label: "Advanced", value: "4.0", blurb: "Strategic play" },
  L4_5: { label: "Competitive", value: "4.5", blurb: "Tournament ready" },
  L5_0: { label: "Elite", value: "5.0", blurb: "Top amateur" },
  L5_5: { label: "Professional", value: "5.5", blurb: "Pro level" },
};
