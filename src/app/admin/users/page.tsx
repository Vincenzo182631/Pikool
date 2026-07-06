import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const me = await getCurrentUser();

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { profile: { username: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { profile: { select: { username: true, avatarUrl: true } }, roles: true },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Users</h1>
      <p className="mb-4 text-sm text-muted-foreground">{users.length} shown · manage roles and access.</p>

      <form className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search email, name, username…"
            className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isAdmin = u.roles.some((r) => r.role === "ADMIN");
              const suspended = Boolean(u.deletedAt);
              const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
              return (
                <tr key={u.id} className="bg-card">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.profile?.avatarUrl} fallback={initials(u.firstName, u.lastName)} size={36} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {name || u.profile?.username || "—"}
                          {suspended && <Badge variant="destructive" className="ml-2">Suspended</Badge>}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        u.roles.map((r) => (
                          <Badge key={r.id} variant={r.role === "ADMIN" ? "default" : "secondary"}>
                            {r.role.replace(/_/g, " ").toLowerCase()}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDistanceToNow(u.createdAt, { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions userId={u.id} isAdmin={isAdmin} suspended={suspended} isSelf={u.id === me?.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
