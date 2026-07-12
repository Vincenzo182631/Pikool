import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayerProfile } from "@/lib/services/player-profile";
import { PlayerProfile } from "@/components/profile/player-profile";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const viewer = await getCurrentUser();
  const data = await getPlayerProfile(username, viewer?.id ?? null);
  if (!data) notFound();

  return <PlayerProfile data={data} />;
}
