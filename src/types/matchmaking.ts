export interface MyAvailability {
  id: string;
  format: string;
  radiusM: number;
  startsAt: string;
  expiresAt: string;
}

export interface AvailablePlayer {
  userId: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  initials: string;
  skillLevel: string;
  ratingValue: number;
  city: string | null;
  formats: string[];
  /** The active availability signal that surfaced this player. */
  format: string;
  expiresAt: string;
  distanceM: number;
  distanceLabel: string;
  /** Relationship to the viewer: pending invite state. */
  requestStatus: "none" | "sent" | "incoming";
  requestId: string | null;
}

export interface PlayersResponse {
  players: AvailablePlayer[];
  myAvailability: MyAvailability | null;
}

export interface RequestParty {
  userId: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  initials: string;
  skillLevel: string;
}

export interface MatchRequestItem {
  id: string;
  status: string;
  format: string;
  message: string | null;
  proposedAt: string | null;
  courtName: string | null;
  createdAt: string;
  direction: "incoming" | "outgoing";
  party: RequestParty;
}

export interface RequestsResponse {
  incoming: MatchRequestItem[];
  outgoing: MatchRequestItem[];
}
