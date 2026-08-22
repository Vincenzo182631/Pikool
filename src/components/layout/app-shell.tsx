"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search, Settings, ShieldCheck } from "lucide-react";
import { NAV_ITEMS, PRIMARY_TABS, tabForPath, APP_NAME } from "@/lib/constants";
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
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card/40 md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-ink text-primary">
              <span className="text-sm font-black">P</span>
            </span>
            <span className="font-display text-lg font-extrabold text-ink">{APP_NAME}</span>
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
                    ? "bg-primary text-ink"
                    : "text-muted-foreground hover:bg-secondary hover:text-ink",
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
              <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
              <input
                placeholder="Search players, courts, clubs…"
                className="h-[46px] w-full rounded-full bg-card pl-10 pr-4 text-sm text-ink shadow-icon outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        {/* pb clears the floating pill on mobile (handoff: 120px clearance) */}
        <main className="flex-1 px-5 py-6 pb-32 sm:px-6 md:pb-10 lg:px-8">{children}</main>

        {/* Floating pill nav (mobile) */}
        <nav
          aria-label="Primary"
          className="pointer-events-none fixed inset-x-0 bottom-[22px] z-40 flex justify-center md:hidden"
        >
          <div className="nav-blur pointer-events-auto inline-flex gap-2 rounded-full p-1.5 shadow-nav">
            {PRIMARY_TABS.map((item) => {
              const active = tabForPath(pathname) === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "grid size-[46px] place-items-center rounded-full text-ink press press-icon",
                    active ? "bg-primary shadow-[0_4px_12px_rgba(184,218,30,0.4)]" : "opacity-40",
                  )}
                >
                  <item.icon className="size-5" strokeWidth={1.8} />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
