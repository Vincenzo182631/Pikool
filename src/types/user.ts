export interface MeProfile {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  skillLevel: string;
  ratingValue: number;
  dominantHand: string;
  playingStyle: string | null;
  yearsPlaying: number;
  favoritePaddle: string | null;
  formats: string[];
  availability: string[];
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
  longestStreak: number;
  followersCount: number;
  followingCount: number;
}

export interface MeSettings {
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: string;
  showLocation: boolean;
  showStats: boolean;
}

export interface Me {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
  profile: MeProfile | null;
  settings: MeSettings | null;
  /** 0–100 completeness of the player profile. */
  profileCompletion: number;
}
