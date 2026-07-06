"use client";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useMe } from "@/hooks/use-auth";

export default function OnboardingPage() {
  const { data: me, isLoading } = useMe();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl flex-col justify-center py-8">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-2 w-full animate-pulse rounded-full bg-secondary" />
          <div className="h-80 animate-pulse rounded-3xl bg-secondary" />
        </div>
      ) : (
        <OnboardingWizard me={me ?? null} />
      )}
    </div>
  );
}
