"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId, removable }: { reportId: string; removable: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function resolve(status: "RESOLVED" | "DISMISSED", removeContent = false) {
    setBusy(status + (removeContent ? "-rm" : ""));
    try {
      await api.post(`/api/admin/reports/${reportId}`, { status, removeContent });
      toast.success(removeContent ? "Content removed & resolved" : status === "RESOLVED" ? "Resolved" : "Dismissed");
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
        <Button size="sm" variant="destructive" loading={busy === "RESOLVED-rm"} onClick={() => resolve("RESOLVED", true)}>
          Remove content
        </Button>
      )}
      <Button size="sm" variant="outline" loading={busy === "RESOLVED"} onClick={() => resolve("RESOLVED")}>
        Resolve
      </Button>
      <Button size="sm" variant="ghost" loading={busy === "DISMISSED"} onClick={() => resolve("DISMISSED")}>
        Dismiss
      </Button>
    </div>
  );
}
