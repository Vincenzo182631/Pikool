"use client";

import * as React from "react";
import { Check, Share2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Follow button — UI only for now (wired to the follow API in a later phase). */
export function FollowButton({ username }: { username: string }) {
  const [following, setFollowing] = React.useState(false);
  return (
    <Button
      size="sm"
      variant={following ? "secondary" : "default"}
      onClick={() => {
        setFollowing((v) => !v);
        toast.message(following ? `Unfollowed @${username}` : `Following @${username}`);
      }}
    >
      {following ? <Check /> : <UserPlus />}
      {following ? "Following" : "Follow"}
    </Button>
  );
}

/** Share the profile via the Web Share API, falling back to clipboard. */
export function ShareButton({ username }: { username: string }) {
  async function share() {
    const url = `${window.location.origin}/players/${username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `@${username} on PicklePlay`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied to clipboard");
      }
    } catch {
      /* user cancelled share — no-op */
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={share} aria-label="Share profile">
      <Share2 />
    </Button>
  );
}
