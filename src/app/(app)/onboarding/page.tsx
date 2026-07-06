"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { useMe } from "@/hooks/use-auth";

export default function OnboardingPage() {
  const { data: me, isLoading } = useMe();

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set up your profile</CardTitle>
          <CardDescription>
            This powers matchmaking and your player card. You can edit it anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-secondary" />
          ) : (
            <ProfileForm mode="onboarding" me={me ?? null} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
