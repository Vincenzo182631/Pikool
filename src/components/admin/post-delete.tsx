"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function PostDelete({ postId }: { postId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function remove() {
    if (!window.confirm("Remove this post?")) return;
    setBusy(true);
    try {
      await api.del(`/api/posts/${postId}`);
      toast.success("Post removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size="sm" variant="destructive" loading={busy} onClick={remove}>
      Remove
    </Button>
  );
}
