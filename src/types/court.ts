export type BusyLevel = "quiet" | "moderate" | "busy";

export interface CourtListItem {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
  surface: string;
  environment: string;
  hasLighting: boolean;
  amenities: string[];
  ratingAvg: number;
  ratingCount: number;
  reviewCount: number;
  verified: boolean;
  thumbnailUrl: string | null;
  occupancy: number;
  busyLevel: BusyLevel;
  distanceM: number | null;
  saved: boolean;
}

export interface CourtPlayer {
  userId: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
  initials: string;
  skillLevel: string | null;
  since: string;
}

export interface CourtReview {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  author: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
    initials: string;
  };
}

export interface CourtDetail {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
  surface: string;
  environment: string;
  hasLighting: boolean;
  amenities: string[];
  openPlaySchedule: unknown;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  photos: string[];
  occupancy: number;
  busyLevel: BusyLevel;
  skillLevels: string[];
  players: CourtPlayer[];
  reviews: CourtReview[];
  savedByMe: boolean;
  checkedInByMe: boolean;
}
