import {
  Lightbulb,
  Trophy,
  MapPin,
  Star,
  Users,
  Megaphone,
  ImageIcon,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

/** Display metadata per post type (labels + icons for composer and cards). */
export const POST_TYPE_META: Record<string, { label: string; icon: LucideIcon }> = {
  TRAINING_TIP: { label: "Tip", icon: Lightbulb },
  MATCH_RESULT: { label: "Match result", icon: Trophy },
  COURT_REVIEW: { label: "Court review", icon: MapPin },
  PADDLE_REVIEW: { label: "Paddle review", icon: Star },
  GAME_INVITE: { label: "Game invite", icon: Users },
  TOURNAMENT_NEWS: { label: "Tournament", icon: Megaphone },
  PHOTO: { label: "Photo", icon: ImageIcon },
  POLL: { label: "Poll", icon: BarChart3 },
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
