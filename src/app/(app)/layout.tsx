import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { serializeMe } from "@/lib/services/user";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const initialUser = user ? serializeMe(user) : null;
  return <AppShell initialUser={initialUser}>{children}</AppShell>;
}
