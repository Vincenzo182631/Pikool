import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import type { Me } from "@/hooks/use-auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const initialUser: Me | null = user
    ? {
        id: user.id,
        email: user.email,
        emailVerified: Boolean(user.emailVerified),
        roles: user.roles.map((r) => r.role),
        profile: user.profile
          ? {
              username: user.profile.username,
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              avatarUrl: user.profile.avatarUrl,
              skillLevel: user.profile.skillLevel,
              ratingValue: user.profile.ratingValue,
              city: user.profile.city,
              country: user.profile.country,
              gamesPlayed: user.profile.gamesPlayed,
              wins: user.profile.wins,
              losses: user.profile.losses,
              currentStreak: user.profile.currentStreak,
            }
          : null,
      }
    : null;

  return <AppShell initialUser={initialUser}>{children}</AppShell>;
}
