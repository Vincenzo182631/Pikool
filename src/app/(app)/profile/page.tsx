import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** `/profile` resolves to the signed-in player's public card. */
export default async function ProfileIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.username) redirect("/onboarding");
  redirect(`/players/${user.profile.username}`);
}
