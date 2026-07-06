"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { PlayersResponse, RequestsResponse, MyAvailability } from "@/types/matchmaking";
import type { BroadcastInput, CreateRequestInput } from "@/lib/validation/matchmaking";

const PLAYERS_KEY = ["mm", "players"];
const REQUESTS_KEY = ["mm", "requests"];
const AVAILABILITY_KEY = ["mm", "availability"];

/** Nearby available players. Pass null to disable until we have coordinates. */
export function usePlayers(query: string | null) {
  return useQuery({
    queryKey: [...PLAYERS_KEY, query],
    queryFn: () => api.get<PlayersResponse>(`/api/matchmaking/players?${query}`),
    enabled: query !== null,
    refetchInterval: 30_000,
  });
}

/** My own broadcast state — independent of whether we have coordinates yet. */
export function useMyAvailability() {
  return useQuery({
    queryKey: AVAILABILITY_KEY,
    queryFn: () => api.get<{ availability: MyAvailability | null }>("/api/matchmaking/availability"),
    refetchInterval: 60_000,
  });
}

export function useRequests() {
  return useQuery({
    queryKey: REQUESTS_KEY,
    queryFn: () => api.get<RequestsResponse>("/api/matchmaking/requests"),
    refetchInterval: 30_000,
  });
}

function useInvalidateMatchmaking() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: PLAYERS_KEY });
    qc.invalidateQueries({ queryKey: REQUESTS_KEY });
    qc.invalidateQueries({ queryKey: AVAILABILITY_KEY });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
}

export function useBroadcast() {
  const invalidate = useInvalidateMatchmaking();
  return useMutation({
    mutationFn: (input: BroadcastInput) =>
      api.post<{ notified: number }>("/api/matchmaking/availability", input),
    onSuccess: invalidate,
  });
}

export function useStopBroadcast() {
  const invalidate = useInvalidateMatchmaking();
  return useMutation({
    mutationFn: () => api.del("/api/matchmaking/availability"),
    onSuccess: invalidate,
  });
}

export function useSendInvite() {
  const invalidate = useInvalidateMatchmaking();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => api.post("/api/matchmaking/requests", input),
    onSuccess: invalidate,
  });
}

export function useRespondInvite() {
  const invalidate = useInvalidateMatchmaking();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "decline" | "cancel" }) =>
      api.post(`/api/matchmaking/requests/${id}`, { action }),
    onSuccess: invalidate,
  });
}
