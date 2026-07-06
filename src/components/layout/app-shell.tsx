"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search, Settings, ShieldCheck } from "lucide-react";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import { useMe, useLogout, type Me } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";

export function AppShell({
  initialUser,
  children,
}: {
  initialUser: Me | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isError } = useMe();
  const logout = useLogout();
  const user = data ?? initialUser;

  React.useEffect(() => {
    if (isError && !initialUser) router.replace("/login");
  }, [isError, initialUser, router]);

  const name =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : (user?.email ?? "");

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card/50 md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground clay-sm">
              <span className="text-sm font-black">P</span>
            </span>
            <span className="font-bold tracking-tight">{APP_NAME}</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-all",
                  active
                    ? "bg-primary text-primary-foreground clay-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary"
          >
            <Avatar
              src={user?.profile?.avatarUrl}
              fallback={initials(user?.firstName, user?.lastName)}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name || "—"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.profile ? `@${user.profile.username}` : user?.email}
              </p>
            </div>
            <Settings className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative hidden max-w-md flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search players, courts, clubs…"
                className="h-10 w-full rounded-full border border-border/60 bg-secondary/60 pl-9 pr-4 text-sm outline-none clay-inset focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          {user?.roles.includes("ADMIN") && (
            <Button asChild variant="ghost" size="icon" aria-label="Admin">
              <Link href="/admin">
                <ShieldCheck />
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            loading={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => router.replace("/login"),
              })
            }
          >
            <LogOut />
          </Button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        {/* Bottom nav (mobile) */}
        <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-border bg-background/90 backdrop-blur md:hidden">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-2xl transition-all",
                    active && "bg-primary text-primary-foreground clay-sm",
                  )}
                >
                  <item.icon className="size-5" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
