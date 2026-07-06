"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

type Action = "suspend" | "restore" | "grantAdmin" | "revokeAdmin" | "purge";

export function UserActions({
  userId,
  isAdmin,
  suspended,
  isSelf,
}: {
  userId: string;
  isAdmin: boolean;
  suspended: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<Action | null>(null);

  async function run(action: Action, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(action);
    try {
      await api.patch(`/api/admin/users/${userId}`, { action });
      toast.success("Done");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {isAdmin ? (
        <Button size="sm" variant="outline" loading={busy === "revokeAdmin"} disabled={isSelf} onClick={() => run("revokeAdmin")}>
          Revoke admin
        </Button>
      ) : (
        <Button size="sm" variant="outline" loading={busy === "grantAdmin"} onClick={() => run("grantAdmin")}>
          Make admin
        </Button>
      )}
      {suspended ? (
        <Button size="sm" variant="outline" loading={busy === "restore"} onClick={() => run("restore")}>
          Restore
        </Button>
      ) : (
        <Button size="sm" variant="outline" loading={busy === "suspend"} disabled={isSelf} onClick={() => run("suspend")}>
          Suspend
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        loading={busy === "purge"}
        disabled={isSelf}
        onClick={() => run("purge", "Permanently delete this user and all their data? This cannot be undone.")}
      >
        Purge
      </Button>
    </div>
  );
}
