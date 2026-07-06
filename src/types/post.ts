export interface FeedAuthor {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  initials: string;
  skillLevel: string | null;
}

export interface PollOption {
  text: string;
  votes: number;
  pct: number;
}

export interface PostItem {
  id: string;
  type: string;
  body: string | null;
  mediaUrls: string[];
  createdAt: string;
  author: FeedAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  isMine: boolean;
  meta: {
    score?: string;
    result?: "WIN" | "LOSS" | "DRAW";
    rating?: number;
    subject?: string;
  } | null;
  poll: {
    options: PollOption[];
    totalVotes: number;
    myVote: number | null;
  } | null;
}

export interface PostComment {
  id: string;
  body: string;
  createdAt: string;
  author: FeedAuthor;
  isMine: boolean;
}
