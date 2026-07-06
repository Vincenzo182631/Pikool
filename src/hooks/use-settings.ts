"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import type { UpdateSettingsInput } from "@/lib/validation/settings";

/** Persist a partial settings update and refresh the cached user. */
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => api.patch("/api/settings", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Couldn't save settings.");
    },
  });
}
