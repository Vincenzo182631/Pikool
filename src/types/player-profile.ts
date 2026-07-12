/** Serialized data for the premium player-card profile (client-safe). */

export type GalleryCategory = "Tournament" | "Training" | "Equipment" | "Lifestyle";

export interface PlayerProfileData {
  isOwner: boolean;

  // Identity
  username: string;
  displayName: string;
  fullName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  showLocation: boolean;
  showStats: boolean;

  // Rating / level
  skillLevel: string; // e.g. "L4_0"
  ratingLabel: string; // e.g. "4.0"
  levelLabel: string; // SKILL_META label, e.g. "Advanced"
  levelTier: "Beginner" | "Intermediate" | "Advanced" | "Pro";

  // Play identity
  dominantHand: string; // "Right"
  yearsPlaying: number;
  favoritePaddle: string | null;
  playingStyle: string | null;
  homeCourt: { name: string; city: string | null } | null;
  formats: string[]; // ["Singles", "Doubles", "Mixed"]
  availability: string[]; // human labels
  memberSince: string;

  // Stats
  stats: {
    rating: number;
    games: number;
    wins: number;
    losses: number;
    winPct: number;
    currentStreak: number;
    longestStreak: number;
    followers: number;
    following: number;
  };
  medals: { gold: number; silver: number; bronze: number };

  // Collectibles (with earned dates)
  badges: { id: string; name: string; description: string; tier: string; date: string }[];
  achievements: { id: string; name: string; description: string; date: string }[];

  // Charts (ascending by time). Each point ~ one recorded match.
  ratingSeries: { t: string; v: number; win: boolean }[];

  // Timeline
  activity: { id: string; kind: ActivityKind; title: string; detail: string | null; date: string }[];

  // Gallery (derived from the player's own media posts)
  gallery: { id: string; url: string; category: GalleryCategory; date: string; postId: string }[];
}

export type ActivityKind =
  | "join"
  | "profile"
  | "post"
  | "media"
  | "achievement"
  | "match"
  | "generic";
