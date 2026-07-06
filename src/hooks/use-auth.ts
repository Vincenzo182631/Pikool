"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface MeProfile {
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  skillLevel: string;
  ratingValue: number;
  city: string | null;
  country: string | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
}

export interface Me {
  id: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  profile: MeProfile | null;
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<Me>("/api/users/me"),
    retry: false,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/auth/logout"),
    onSuccess: () => {
      qc.setQueryData(["me"], null);
      qc.clear();
    },
  });
}
