"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch, api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function CourtAdminActions({ courtId, verified }: { courtId: string; verified: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function toggle() {
    setBusy("verify");
    try {
      await api.patch(`/api/admin/courts/${courtId}`, { verified: !verified });
      toast.success(verified ? "Unverified" : "Verified");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this court? This cannot be undone.")) return;
    setBusy("delete");
    try {
      await apiFetch(`/api/admin/courts/${courtId}`, { method: "DELETE" });
      toast.success("Court deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Button size="sm" variant="outline" loading={busy === "verify"} onClick={toggle}>
        {verified ? "Unverify" : "Verify"}
      </Button>
      <Button size="sm" variant="destructive" loading={busy === "delete"} onClick={remove}>
        Delete
      </Button>
    </div>
  );
}
