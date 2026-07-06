"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

/** Resolve every open report for a target at once. */
export function ReportActions({
  targetType,
  targetId,
  removable,
}: {
  targetType: string;
  targetId: string;
  removable: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function act(action: "remove" | "resolve" | "dismiss") {
    setBusy(action);
    try {
      await api.post("/api/admin/reports/resolve", { targetType, targetId, action });
      toast.success(
        action === "remove"
          ? "Content removed & reports resolved"
          : action === "resolve"
            ? "Resolved"
            : "Dismissed",
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {removable && (
        <Button size="sm" variant="destructive" loading={busy === "remove"} onClick={() => act("remove")}>
          Remove content
        </Button>
      )}
      <Button size="sm" variant="outline" loading={busy === "resolve"} onClick={() => act("resolve")}>
        Resolve
      </Button>
      <Button size="sm" variant="ghost" loading={busy === "dismiss"} onClick={() => act("dismiss")}>
        Dismiss
      </Button>
    </div>
  );
}
