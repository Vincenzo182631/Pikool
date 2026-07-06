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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Map", href: "/map", icon: Map },
  { label: "Feed", href: "/feed", icon: Newspaper },
  { label: "Matchmaking", href: "/matchmaking", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Clubs", href: "/clubs", icon: Store },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
];

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
