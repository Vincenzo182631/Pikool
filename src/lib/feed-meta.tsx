import {
  Lightbulb,
  Trophy,
  MapPin,
  Star,
  Users,
  Megaphone,
  ImageIcon,
  BarChart3,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

/** Display metadata per post type: label, icon, and a soft pastel clay tone. */
export const POST_TYPE_META: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  TRAINING_TIP: { label: "Tip", icon: Lightbulb, tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300" },
  MATCH_RESULT: { label: "Match result", icon: Trophy, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
  COURT_REVIEW: { label: "Court review", icon: MapPin, tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300" },
  PADDLE_REVIEW: { label: "Paddle review", icon: Star, tone: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300" },
  GAME_INVITE: { label: "Game invite", icon: Users, tone: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300" },
  TOURNAMENT_NEWS: { label: "Tournament", icon: Megaphone, tone: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300" },
  PHOTO: { label: "Photo", icon: ImageIcon, tone: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300" },
  POLL: { label: "Poll", icon: BarChart3, tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300" },
  // Not composer-creatable — generated when a player joins the community.
  WELCOME: { label: "New member", icon: PartyPopper, tone: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300" },
};

export const COMPOSER_TYPES = [
  "TRAINING_TIP",
  "MATCH_RESULT",
  "COURT_REVIEW",
  "PADDLE_REVIEW",
  "GAME_INVITE",
  "TOURNAMENT_NEWS",
  "PHOTO",
  "POLL",
] as const;
