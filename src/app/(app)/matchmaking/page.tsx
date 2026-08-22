import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { MatchmakingClient } from "@/components/matchmaking/matchmaking-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Matches" };

export default async function MatchmakingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const p = user.profile;

  return (
    <MatchmakingClient
      stats={{
        matches: p?.gamesPlayed ?? 0,
        wins: p?.wins ?? 0,
        rating: p ? p.ratingValue : null,
      }}
    />
  );
}
