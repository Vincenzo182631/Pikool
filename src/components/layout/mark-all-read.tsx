"use client";

import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { useMarkNotificationsRead } from "@/hooks/use-notifications";

/** "Mark all read" affordance for the notifications page. */
export function MarkAllRead() {
  const router = useRouter();
  const markRead = useMarkNotificationsRead();

  return (
    <button
      type="button"
      disabled={markRead.isPending}
      onClick={() => markRead.mutate({ all: true }, { onSuccess: () => router.refresh() })}
      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-ink disabled:opacity-50"
    >
      <CheckCheck className="size-3.5" /> Mark all read
    </button>
  );
}
